from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import uvicorn
import os
import json
import time
import logging
from datetime import datetime

# Import automation modules
from automations import (
    email_automation,
    excel_automation,
    browser_automation,
    system_automation,
    ocr_automation,
    file_automation,
    word_automation,
    outlook_automation,
    clipboard_automation
)

# Import event emitter
from utils.event_emitter import emit_log, emit_progress, emit_result, emit_error

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("automation_server.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("automation-server")

app = FastAPI(title="Desktop Automation API", description="Python-based desktop automation API for AI Assistant")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class AutomationRequest(BaseModel):
    action: str
    target: str
    parameters: Dict[str, Any] = {}
    confirm_risky: bool = False

class AutomationResponse(BaseModel):
    success: bool
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    execution_time: float
    requires_confirmation: bool = False
    confirmation_message: Optional[str] = None

# Store running tasks
running_tasks = {}

# Store scheduled tasks
scheduled_tasks = {}

@app.get("/")
async def root():
    return {"status": "Desktop Automation API is running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "running_tasks": len(running_tasks),
        "scheduled_tasks": len(scheduled_tasks),
        "available_targets": [
            "email", "excel", "browser", "system", "ocr", "files", 
            "word", "outlook", "clipboard"
        ]
    }

def is_risky_action(action: str, target: str, parameters: Dict[str, Any]) -> tuple[bool, str]:
    """Check if an action is risky and requires confirmation"""
    risky_keywords = ["delete", "remove", "clear", "send", "email", "mail", "post", "publish", "share", "execute"]
    
    # Check action name
    if any(keyword in action.lower() for keyword in risky_keywords):
        return True, f"This action ({action}) might perform sensitive operations. Are you sure you want to proceed?"
    
    # Check specific combinations
    if target.lower() == "email" and action.lower() in ["send", "compose"]:
        return True, f"This will send an email to {parameters.get('to', 'recipients')}. Are you sure you want to proceed?"
    
    if target.lower() == "files" and any(keyword in action.lower() for keyword in ["delete", "move", "rename"]):
        return True, f"This will modify files in {parameters.get('directory', 'your filesystem')}. Are you sure you want to proceed?"
    
    if target.lower() == "system" and action.lower() == "run_command":
        return True, f"This will execute a system command: {parameters.get('command', '')}. Are you sure you want to proceed?"
    
    return False, ""

@app.post("/automate", response_model=AutomationResponse)
async def run_automation(request: AutomationRequest, background_tasks: BackgroundTasks):
    start_time = time.time()
    logger.info(f"Received automation request: {request.action} on {request.target}")
    emit_log(f"Received request: {request.action} on {request.target}")
    
    # Check if action is risky and requires confirmation
    is_risky, confirmation_message = is_risky_action(request.action, request.target, request.parameters)
    
    if is_risky and not request.confirm_risky:
        execution_time = time.time() - start_time
        return AutomationResponse(
            success=False,
            requires_confirmation=True,
            confirmation_message=confirmation_message,
            execution_time=execution_time
        )
    
    try:
        # Route to appropriate automation module based on target
        emit_log(f"Starting {request.target} automation: {request.action}")
        emit_progress(1, 3, f"Initializing {request.action} on {request.target}")
        
        if request.target.lower() == "email":
            result = await email_automation.handle_action(request.action, request.parameters)
        elif request.target.lower() == "excel":
            result = await excel_automation.handle_action(request.action, request.parameters)
        elif request.target.lower() == "browser":
            result = await browser_automation.handle_action(request.action, request.parameters)
        elif request.target.lower() == "system":
            result = await system_automation.handle_action(request.action, request.parameters)
        elif request.target.lower() == "ocr":
            result = await ocr_automation.handle_action(request.action, request.parameters)
        elif request.target.lower() == "files":
            result = await file_automation.handle_action(request.action, request.parameters)
        elif request.target.lower() == "word":
            result = await word_automation.handle_action(request.action, request.parameters)
        elif request.target.lower() == "outlook":
            result = await outlook_automation.handle_action(request.action, request.parameters)
        elif request.target.lower() == "clipboard":
            result = await clipboard_automation.handle_action(request.action, request.parameters)
        else:
            emit_error(f"Unsupported target: {request.target}")
            raise HTTPException(status_code=400, detail=f"Unsupported target: {request.target}")
        
        execution_time = time.time() - start_time
        logger.info(f"Completed {request.action} in {execution_time:.2f}s")
        emit_progress(3, 3, f"Completed {request.action} successfully")
        emit_result(True, result, f"Successfully completed {request.action} on {request.target}")
        
        return AutomationResponse(
            success=True,
            result=result,
            execution_time=execution_time
        )
    
    except Exception as e:
        logger.error(f"Error executing {request.action}: {str(e)}", exc_info=True)
        execution_time = time.time() - start_time
        emit_error(f"Error executing {request.action}: {str(e)}")
        
        return AutomationResponse(
            success=False,
            error=str(e),
            execution_time=execution_time
        )

@app.post("/automate/async")
async def run_automation_async(request: AutomationRequest, background_tasks: BackgroundTasks):
    task_id = f"{request.target}_{request.action}_{int(time.time())}"
    
    # Check if action is risky and requires confirmation
    is_risky, confirmation_message = is_risky_action(request.action, request.target, request.parameters)
    
    if is_risky and not request.confirm_risky:
        return {
            "task_id": task_id,
            "status": "requires_confirmation",
            "confirmation_message": confirmation_message
        }
    
    # Add task to background tasks
    background_tasks.add_task(
        execute_automation_task, 
        task_id=task_id,
        target=request.target,
        action=request.action,
        parameters=request.parameters
    )
    
    running_tasks[task_id] = {
        "status": "running",
        "start_time": time.time(),
        "request": request.dict()
    }
    
    emit_log(f"Started background task: {task_id}")
    
    return {
        "task_id": task_id,
        "status": "running"
    }

@app.post("/workflow/execute")
async def execute_workflow(workflow: Dict[str, Any], background_tasks: BackgroundTasks):
    workflow_id = f"workflow_{int(time.time())}"
    steps = workflow.get("steps", [])
    
    if not steps:
        return {
            "success": False,
            "error": "Workflow must contain at least one step"
        }
    
    # Add workflow to background tasks
    background_tasks.add_task(
        execute_workflow_task,
        workflow_id=workflow_id,
        steps=steps,
        name=workflow.get("name", "Unnamed Workflow")
    )
    
    running_tasks[workflow_id] = {
        "status": "running",
        "start_time": time.time(),
        "workflow": workflow
    }
    
    emit_log(f"Started workflow: {workflow.get('name', 'Unnamed Workflow')}")
    
    return {
        "workflow_id": workflow_id,
        "status": "running"
    }

@app.post("/schedule/task")
async def schedule_task(task_data: Dict[str, Any]):
    task_id = f"scheduled_{int(time.time())}"
    
    scheduled_tasks[task_id] = {
        "id": task_id,
        "created_at": time.time(),
        "next_run": task_data.get("next_run"),
        "schedule": task_data.get("schedule"),
        "task": task_data.get("task"),
        "status": "scheduled"
    }
    
    emit_log(f"Scheduled new task: {task_data.get('task', {}).get('action', 'Unknown')}")
    
    return {
        "task_id": task_id,
        "status": "scheduled"
    }

@app.get("/schedule/tasks")
async def get_scheduled_tasks():
    return {
        "tasks": list(scheduled_tasks.values())
    }

@app.delete("/schedule/task/{task_id}")
async def delete_scheduled_task(task_id: str):
    if task_id in scheduled_tasks:
        task = scheduled_tasks.pop(task_id)
        return {
            "success": True,
            "task": task
        }
    
    return {
        "success": False,
        "error": f"Task {task_id} not found"
    }

@app.get("/tasks/{task_id}")
async def get_task_status(task_id: str):
    if task_id not in running_tasks:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    
    return running_tasks[task_id]

@app.get("/tasks")
async def list_tasks():
    return running_tasks

async def execute_automation_task(task_id: str, target: str, action: str, parameters: Dict[str, Any]):
    try:
        start_time = time.time()
        logger.info(f"Starting background task {task_id}: {action} on {target}")
        emit_log(f"Starting background task: {action} on {target}")
        emit_progress(1, 3, f"Initializing {action} on {target}")
        
        # Route to appropriate automation module based on target
        if target.lower() == "email":
            result = await email_automation.handle_action(action, parameters)
        elif target.lower() == "excel":
            result = await excel_automation.handle_action(action, parameters)
        elif target.lower() == "browser":
            result = await browser_automation.handle_action(action, parameters)
        elif target.lower() == "system":
            result = await system_automation.handle_action(action, parameters)
        elif target.lower() == "ocr":
            result = await ocr_automation.handle_action(action, parameters)
        elif target.lower() == "files":
            result = await file_automation.handle_action(action, parameters)
        elif target.lower() == "word":
            result = await word_automation.handle_action(action, parameters)
        elif target.lower() == "outlook":
            result = await outlook_automation.handle_action(action, parameters)
        elif target.lower() == "clipboard":
            result = await clipboard_automation.handle_action(action, parameters)
        else:
            raise ValueError(f"Unsupported target: {target}")
        
        execution_time = time.time() - start_time
        emit_progress(3, 3, f"Completed {action} successfully")
        emit_result(True, result, f"Successfully completed {action} on {target}")
        
        # Update task status
        running_tasks[task_id] = {
            "status": "completed",
            "start_time": start_time,
            "end_time": time.time(),
            "execution_time": execution_time,
            "result": result
        }
        
        logger.info(f"Completed background task {task_id} in {execution_time:.2f}s")
    
    except Exception as e:
        logger.error(f"Error in background task {task_id}: {str(e)}", exc_info=True)
        emit_error(f"Error in task {action}: {str(e)}")
        
        # Update task status with error
        running_tasks[task_id] = {
            "status": "failed",
            "start_time": start_time,
            "end_time": time.time(),
            "execution_time": time.time() - start_time,
            "error": str(e)
        }

async def execute_workflow_task(workflow_id: str, steps: List[Dict[str, Any]], name: str):
    results = []
    current_step = 1
    total_steps = len(steps)
    
    emit_log(f"Starting workflow: {name} with {total_steps} steps")
    emit_progress(0, total_steps, f"Starting workflow: {name}")
    
    try:
        for step in steps:
            step_name = step.get("name", f"Step {current_step}")
            emit_log(f"Executing workflow step {current_step}/{total_steps}: {step_name}")
            emit_progress(current_step, total_steps, f"Executing: {step_name}")
            
            target = step.get("target")
            action = step.get("action")
            parameters = step.get("parameters", {})
            
            try:
                # Route to appropriate automation module based on target
                if target.lower() == "email":
                    result = await email_automation.handle_action(action, parameters)
                elif target.lower() == "excel":
                    result = await excel_automation.handle_action(action, parameters)
                elif target.lower() == "browser":
                    result = await browser_automation.handle_action(action, parameters)
                elif target.lower() == "system":
                    result = await system_automation.handle_action(action, parameters)
                elif target.lower() == "ocr":
                    result = await ocr_automation.handle_action(action, parameters)
                elif target.lower() == "files":
                    result = await file_automation.handle_action(action, parameters)
                elif target.lower() == "word":
                    result = await word_automation.handle_action(action, parameters)
                elif target.lower() == "outlook":
                    result = await outlook_automation.handle_action(action, parameters)
                elif target.lower() == "clipboard":
                    result = await clipboard_automation.handle_action(action, parameters)
                else:
                    raise ValueError(f"Unsupported target: {target}")
                
                # Store result
                step_result = {
                    "step": current_step,
                    "name": step_name,
                    "success": True,
                    "result": result
                }
                results.append(step_result)
                
                # Check if we need to pass data to the next step
                if current_step < total_steps and step.get("pass_result_to_next", False):
                    next_step = steps[current_step]
                    next_parameters = next_step.get("parameters", {})
                    
                    # Add result as a parameter to the next step
                    next_parameters["previous_result"] = result
                    steps[current_step]["parameters"] = next_parameters
                
            except Exception as e:
                logger.error(f"Error in workflow step {current_step}: {str(e)}", exc_info=True)
                emit_error(f"Error in workflow step {step_name}: {str(e)}")
                
                # Store error result
                step_result = {
                    "step": current_step,
                    "name": step_name,
                    "success": False,
                    "error": str(e)
                }
                results.append(step_result)
                
                # Check if we should continue on error
                if not step.get("continue_on_error", False):
                    emit_log(f"Workflow {name} stopped at step {current_step} due to error")
                    break
            
            current_step += 1
        
        # Update workflow status
        running_tasks[workflow_id] = {
            "status": "completed",
            "start_time": running_tasks[workflow_id]["start_time"],
            "end_time": time.time(),
            "execution_time": time.time() - running_tasks[workflow_id]["start_time"],
            "results": results,
            "steps_completed": current_step - 1,
            "total_steps": total_steps
        }
        
        emit_progress(total_steps, total_steps, f"Workflow {name} completed")
        emit_result(True, {"steps": results}, f"Workflow {name} completed successfully")
        
    except Exception as e:
        logger.error(f"Error in workflow {workflow_id}: {str(e)}", exc_info=True)
        emit_error(f"Error in workflow {name}: {str(e)}")
        
        # Update workflow status with error
        running_tasks[workflow_id] = {
            "status": "failed",
            "start_time": running_tasks[workflow_id]["start_time"],
            "end_time": time.time(),
            "execution_time": time.time() - running_tasks[workflow_id]["start_time"],
            "error": str(e),
            "results": results,
            "steps_completed": current_step - 1,
            "total_steps": total_steps
        }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

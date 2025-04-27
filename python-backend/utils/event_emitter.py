import json
import subprocess
import sys
import os
from typing import Dict, Any, Optional

def emit_event(event_name: str, payload: Dict[str, Any]) -> None:
    """
    Emit an event to the Tauri frontend using stdout with a special format.
    
    Args:
        event_name: The name of the event to emit
        payload: The data to send with the event
    """
    try:
        # Format the event in a way that Tauri can recognize
        event_data = {
            "__tauri_event": True,
            "event": event_name,
            "payload": payload
        }
        
        # Print to stdout with a special marker that Tauri will recognize
        print(f"__TAURI_EVENT__|{json.dumps(event_data)}", flush=True)
    except Exception as e:
        print(f"Error emitting event: {str(e)}", file=sys.stderr, flush=True)

def emit_log(message: str, level: str = "info", data: Optional[Dict[str, Any]] = None) -> None:
    """
    Emit a log event to the frontend.
    
    Args:
        message: The log message
        level: The log level (info, warning, error, debug)
        data: Optional additional data
    """
    payload = {
        "message": message,
        "level": level,
        "timestamp": None,  # Will be set by frontend
        "data": data or {}
    }
    emit_event("task-log", payload)

def emit_progress(step: int, total_steps: int, message: str, data: Optional[Dict[str, Any]] = None) -> None:
    """
    Emit a progress event to the frontend.
    
    Args:
        step: Current step number
        total_steps: Total number of steps
        message: Progress message
        data: Optional additional data
    """
    payload = {
        "step": step,
        "totalSteps": total_steps,
        "message": message,
        "percentage": int((step / total_steps) * 100) if total_steps > 0 else 0,
        "data": data or {}
    }
    emit_event("task-progress", payload)

def emit_result(success: bool, result: Any, message: str = "") -> None:
    """
    Emit a result event to the frontend.
    
    Args:
        success: Whether the operation was successful
        result: The result data
        message: Optional result message
    """
    payload = {
        "success": success,
        "result": result,
        "message": message
    }
    emit_event("task-result", payload)

def emit_error(message: str, error_type: str = "general", details: Optional[Dict[str, Any]] = None) -> None:
    """
    Emit an error event to the frontend.
    
    Args:
        message: Error message
        error_type: Type of error
        details: Optional error details
    """
    payload = {
        "message": message,
        "type": error_type,
        "details": details or {}
    }
    emit_event("error", payload)

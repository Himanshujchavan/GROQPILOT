// This is a browser-based OCR processor using Tesseract.js
// For a desktop application, you would use a more powerful OCR library

import { createWorker } from "tesseract.js"

export interface OCRResult {
  text: string
  confidence: number
  words: Array<{
    text: string
    confidence: number
    bbox: {
      x0: number
      y0: number
      x1: number
      y1: number
    }
  }>
}

export async function processImage(imageData: string | Blob): Promise<OCRResult> {
  try {
    const worker = await createWorker("eng")

    // Process the image
    const result = await worker.recognize(imageData)

    // Format the result
    const formattedResult: OCRResult = {
      text: result.data.text,
      confidence: result.data.confidence,
      words: result.data.words.map((word) => ({
        text: word.text,
        confidence: word.confidence,
        bbox: word.bbox,
      })),
    }

    // Terminate the worker
    await worker.terminate()

    return formattedResult
  } catch (error) {
    console.error("OCR processing error:", error)
    throw new Error("Failed to process image with OCR")
  }
}

export async function extractInvoiceData(text: string): Promise<{
  invoiceNumber?: string
  date?: string
  total?: string
  vendor?: string
}> {
  try {
    // Send the OCR text to Groq for structured extraction
    const response = await fetch("/api/extract-invoice-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Invoice extraction error:", error)

    // Fallback to simple regex extraction
    const invoiceNumber = text.match(/invoice\s*#?\s*(\w+[-/]?\w+)/i)?.[1]
    const date = text.match(/date\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i)?.[1]
    const total = text.match(/total\s*:?\s*[$€£]?\s*(\d+[.,]\d{2})/i)?.[1]
    const vendor = text.match(/from\s*:?\s*([A-Za-z0-9\s]+(?:Inc|LLC|Ltd|GmbH|Co))/i)?.[1]

    return {
      invoiceNumber,
      date,
      total,
      vendor,
    }
  }
}

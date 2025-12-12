import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { question } = await request.json()
    const isValid = question && question.trim().length > 0

    return NextResponse.json({
      isValid,
      message: isValid ? "Valid question" : "Question cannot be blank",
    })
  } catch (error) {
    return NextResponse.json({ isValid: false, message: "Validation error" }, { status: 400 })
  }
}

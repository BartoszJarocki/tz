import { NextRequest, NextResponse } from 'next/server';
import { detectTimezoneConversions, convertTimezoneMatch } from '@/utils/message-parser';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text') || '3pm CEST -> EST';
  
  console.log('🧪 Testing pattern detection with:', text);
  
  // Test pattern detection
  const matches = detectTimezoneConversions(text);
  console.log('🎯 Detected matches:', matches);
  
  const results = [];
  for (const match of matches) {
    const converted = convertTimezoneMatch(match);
    console.log('🔄 Converted:', converted);
    results.push(converted);
  }
  
  return NextResponse.json({
    input: text,
    matches,
    converted: results,
    success: results.length > 0
  });
}

// import { GoogleGenerativeAI } from '@google/generative-ai';
// import { GoogleGenerativeAIStream, StreamingTextResponse } from 'ai';

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// export async function POST(req: Request) {
//     // Extract the `prompt` from the body of the request
//     const { prompt } = await req.json();

//     // Ask Google Generative AI for a streaming completion given the prompt
//     const response = await genAI
//         .getGenerativeModel({ model: 'gemini-2.0-flash' })
//         .generateContentStream({
//             contents: [{ role: 'user', parts: [{ text: "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment." }] }],
//         });

//     // Convert the response into a friendly text-stream
//     const stream = GoogleGenerativeAIStream(response);

//     // Respond with the stream  
//     return new StreamingTextResponse(stream);
// }


import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        
        const result = await model.generateContent(
            "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment."
        );

        const text = result.response.text();
        
        return Response.json({
            text: text
        });
    } catch (error) {
        console.error('Error generating suggestions:', error);
        return Response.json(
            { error: 'Failed to generate message suggestions' },
            { status: 500 }
        );
    }
}
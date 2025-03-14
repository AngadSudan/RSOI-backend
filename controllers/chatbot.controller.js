import { ApiError, ApiResponse } from '../utils/index.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import keyManager from '../utils/gemini.js';

const getSupport = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res
                .status(400)
                .json(new ApiError(400, 'Please provide a text input.'));
        }
        let attempts = 0;
        const maxAttempts = keyManager.apiKeys.length;
        const prompt = `You are an AI assistant for The Robotics Society (TRS), India, a premier academic society dedicated to promoting robotics research, education, and innovation. Your role is to provide clear, concise, and knowledgeable answers related to TRS, including:
        Robotics research, education, and training
        TRS events, workshops, and conferences
        TRS Student Chapters and their formation guidelines
        Membership benefits and collaboration opportunities
        TRS-SCALE and financial support for student chapters
        If a user asks about topics outside this scope, respond with:
        "I’m an AI assistant for The Robotics Society (TRS), India, and I can only answer questions related to robotics research, education, and TRS activities. Let me know how I can assist you within these areas!"

        If someone asks for TRS contact information, respond with:
        Email: contact@trs.org.in
        Phone: xxx-xxx-xxxx

        Maintain a professional yet friendly tone, ensuring users feel supported and informed within the approved topics.
        Here's what the user asked: ${text}
        `;
        while (attempts < maxAttempts) {
            try {
                const availableKey = keyManager.getAvailableKey();
                if (!availableKey) {
                    throw new ApiError(
                        429,
                        'All API keys are rate-limited. Please try again later.'
                    );
                }

                const genAI = new GoogleGenerativeAI(availableKey);
                const model = genAI.getGenerativeModel({
                    model: 'gemini-1.5-flash',
                });

                const result = await model.generateContent(prompt);
                const supportContent = result.response.text();
                if (!supportContent) {
                    return res
                        .status(400)
                        .json(new ApiError(400, 'No content generated.'));
                }
                return res
                    .status(200)
                    .json(
                        new ApiResponse(
                            200,
                            supportContent,
                            'The result of the response is generated'
                        )
                    );
            } catch (error) {
                if (
                    error.message?.includes('quota') ||
                    error.message?.includes('rate limit')
                ) {
                    keyManager.markKeyAsRateLimited(keyManager.getCurrentKey());
                    attempts++;
                    continue;
                }
                throw error;
            }
        }
    } catch (err) {
        res.status(err.code || 500).json(
            new ApiResponse(err.code || 500, err.message, {
                message:
                    'The chatbot is currently unavaliable please try again later',
            })
        );
    }
};

export { getSupport };

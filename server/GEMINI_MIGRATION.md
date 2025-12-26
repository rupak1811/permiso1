# Migration from OpenAI to Google Gemini API

## ✅ Changes Completed

The AI functionality has been successfully migrated from OpenAI to Google Gemini API.

### 1. Package Update
- **Removed**: `openai` package
- **Added**: `@google/generative-ai` package

### 2. Code Changes
- Updated `server/routes/ai.js` to use Gemini API instead of OpenAI
- Changed from `OpenAI` client to `GoogleGenerativeAI` client
- Updated model from `gpt-3.5-turbo` to `gemini-pro`
- Improved error handling for missing API key

### 3. Environment Variables
- **Old**: `OPENAI_API_KEY`
- **New**: `GEMINI_API_KEY`

## 🔑 Getting Your Gemini API Key

1. **Go to Google AI Studio**:
   - Visit: https://aistudio.google.com/app/apikey
   - Or: https://makersuite.google.com/app/apikey

2. **Sign in** with your Google account

3. **Create API Key**:
   - Click "Create API Key"
   - Select or create a Google Cloud project
   - Copy the generated API key

4. **Add to `.env` file**:
   ```env
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

## 📝 Update Your `.env` File

Replace the old OpenAI key with Gemini key:

```env
# Remove this line:
# OPENAI_API_KEY=sk-your-openai-api-key

# Add this line:
GEMINI_API_KEY=your-gemini-api-key
```

## 🚀 Features Supported

The following AI features now use Gemini:
- ✅ **Chat Assistant** (`/api/ai/chat`) - AI-powered permit assistance
- ✅ **Document Analysis** (`/api/ai/analyze`) - Document processing (currently uses mock data, can be enhanced)
- ✅ **Cost Estimation** (`/api/ai/estimate`) - Project cost estimates
- ✅ **Form Validation** (`/api/ai/validate`) - Form data validation

## 🔧 Configuration

The Gemini API is configured with:
- **Model**: `gemini-pro`
- **Max Output Tokens**: 500
- **Temperature**: 0.7

You can modify these settings in `server/routes/ai.js` if needed.

## ⚠️ Important Notes

1. **API Key Security**: Never commit your API key to version control
2. **Rate Limits**: Gemini API has rate limits - check Google's documentation
3. **Model Availability**: Ensure `gemini-pro` is available in your region
4. **Cost**: Gemini API has different pricing than OpenAI - check Google's pricing page

## 🧪 Testing

After updating your `.env` file:

1. **Restart your server**:
   ```bash
   cd server
   npm start
   ```

2. **Test the chat endpoint**:
   ```bash
   curl -X POST http://localhost:5000/api/ai/chat \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{"message": "What documents do I need for a building permit?"}'
   ```

## 📚 Resources

- **Gemini API Documentation**: https://ai.google.dev/docs
- **Google AI Studio**: https://aistudio.google.com
- **API Reference**: https://ai.google.dev/api

## 🔄 Rollback (If Needed)

If you need to rollback to OpenAI:

1. Update `server/package.json`:
   ```json
   "openai": "^4.20.1"
   ```

2. Revert changes in `server/routes/ai.js`

3. Update `.env` to use `OPENAI_API_KEY` instead

4. Run `npm install` in the server directory


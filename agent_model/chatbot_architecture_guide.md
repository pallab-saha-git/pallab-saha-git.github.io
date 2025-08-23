# Website Chatbot Architecture Guide

## Executive Summary

This document outlines the architecture for building an intelligent chatbot that can be integrated into WordPress and HTML websites. The chatbot reads website content to answer queries, maintains additional knowledge, and escalates to WhatsApp when needed.

## Key Features

- **Multi-platform Integration**: Works with both WordPress and HTML websites
- **Content-based Responses**: Automatically reads and understands website content
- **Additional Knowledge Base**: Supports supplementary information beyond website content
- **WhatsApp Escalation**: Seamlessly transfers complex queries to human support
- **Offline Operation**: No dependency on internet search
- **Cost-efficient Models**: Uses affordable AI models for sustainable operation

## Architecture Options

### 1. Cloud-Based Architecture

**Components:**
- **Frontend**: React/Vue.js widget hosted on CDN
- **Backend**: Serverless functions (AWS Lambda/Google Cloud Functions)
- **AI Models**: OpenAI GPT-3.5 Turbo, Claude Haiku, or Google Gemini Nano
- **Vector Database**: Pinecone, Weaviate Cloud, or Qdrant Cloud
- **Caching**: Redis Cloud
- **WhatsApp**: Twilio API or WhatsApp Business API

**Advantages:**
- Scalable and maintenance-free
- Pay-per-use pricing model
- High availability
- Easy updates

**Estimated Cost:** $95-350/month

### 2. Self-Hosted Architecture

**Components:**
- **Frontend**: JavaScript widget self-hosted
- **Backend**: FastAPI/Flask in Docker containers
- **AI Models**: Llama 2 7B, Mistral 7B, or Phi-2
- **Vector Database**: ChromaDB, FAISS, or Milvus
- **Caching**: Local Redis instance
- **WhatsApp**: WhatsApp Business API

**Advantages:**
- Full control over data
- One-time hardware investment
- No API costs for AI models
- Complete privacy

**Estimated Cost:** $100-300/month (infrastructure only)

## Technical Implementation

### 1. Website Content Ingestion Pipeline

```python
# Example crawler implementation
import scrapy
from sentence_transformers import SentenceTransformer
import chromadb

class WebsiteCrawler:
    def __init__(self, base_url):
        self.base_url = base_url
        self.embedder = SentenceTransformer('all-MiniLM-L6-v2')
        self.vector_db = chromadb.Client()
        
    def crawl_and_index(self):
        # 1. Crawl website pages
        # 2. Extract text content
        # 3. Split into chunks
        # 4. Generate embeddings
        # 5. Store in vector database
        pass
```

### 2. Chatbot Widget Integration

**WordPress Plugin:**
```php
<?php
/*
Plugin Name: AI Chatbot
Description: Intelligent chatbot for customer support
*/

function chatbot_enqueue_scripts() {
    wp_enqueue_script('chatbot-widget', 
        plugin_dir_url(__FILE__) . 'chatbot.js',
        array(), '1.0.0', true);
}
add_action('wp_enqueue_scripts', 'chatbot_enqueue_scripts');

function chatbot_shortcode() {
    return '<div id="chatbot-container"></div>';
}
add_shortcode('ai_chatbot', 'chatbot_shortcode');
?>
```

**HTML Integration:**
```html
<!-- Add to any HTML page -->
<script src="https://your-domain.com/chatbot.js"></script>
<script>
  ChatBot.init({
    apiKey: 'your-api-key',
    position: 'bottom-right',
    primaryColor: '#3498db',
    websiteId: 'site-123'
  });
</script>
```

### 3. Backend API Structure

```python
# FastAPI backend example
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import asyncio

app = FastAPI()

class ChatRequest(BaseModel):
    message: str
    session_id: str
    website_id: str

@app.post("/api/chat")
async def chat(request: ChatRequest):
    # 1. Search vector database for relevant content
    # 2. Generate response using LLM
    # 3. Check confidence score
    # 4. Return response or escalate to WhatsApp
    
    response = await process_chat(request)
    
    if response.confidence < 0.7:
        await escalate_to_whatsapp(request)
        return {"type": "escalation", "message": "Transferring to human support..."}
    
    return {"type": "answer", "message": response.text}
```

### 4. WhatsApp Integration

```python
# Twilio WhatsApp integration
from twilio.rest import Client

class WhatsAppEscalation:
    def __init__(self, account_sid, auth_token):
        self.client = Client(account_sid, auth_token)
        
    def escalate_chat(self, user_phone, chat_history):
        message = self.client.messages.create(
            body=f"New escalation from chatbot:\n{chat_history}",
            from_='whatsapp:+14155238886',
            to=f'whatsapp:{user_phone}'
        )
        return message.sid
```

## AI Model Comparison

| Model | Type | Cost | Performance | Use Case |
|-------|------|------|-------------|----------|
| GPT-3.5 Turbo | Cloud API | $0.0015/1K tokens | Excellent | High-volume, complex queries |
| Claude Haiku | Cloud API | $0.00025/1K tokens | Very Good | Cost-effective, fast responses |
| Llama 2 7B | Self-hosted | Hardware only | Good | Privacy-focused deployments |
| Mistral 7B | Self-hosted | Hardware only | Very Good | Best open-source option |
| Phi-2 | Self-hosted | Hardware only | Good | Resource-constrained environments |

## Implementation Timeline

### Phase 1: Foundation (Weeks 1-2)
- Set up development environment
- Choose AI model and vector database
- Create basic chatbot widget
- Implement simple Q&A functionality

### Phase 2: Core Features (Weeks 3-4)
- Develop website crawler
- Implement content chunking and embedding
- Set up vector database
- Create chat API with context management

### Phase 3: Integration (Weeks 5-6)
- Develop WordPress plugin
- Create HTML integration script
- Implement WhatsApp escalation
- Add analytics and monitoring

## Security Considerations

1. **API Security**
   - Implement API key authentication
   - Use rate limiting to prevent abuse
   - Enable CORS with specific origins

2. **Data Privacy**
   - Encrypt sensitive data in transit and at rest
   - Implement GDPR compliance features
   - Provide data deletion capabilities

3. **Input Validation**
   - Sanitize all user inputs
   - Implement content filtering
   - Prevent prompt injection attacks

## Monitoring and Analytics

```python
# Example monitoring setup
import logging
from datetime import datetime

class ChatbotAnalytics:
    def track_query(self, query, response, confidence):
        logging.info({
            'timestamp': datetime.now(),
            'query': query,
            'response_type': 'answer' if confidence > 0.7 else 'escalation',
            'confidence': confidence,
            'response_time': response.duration
        })
```

## Best Practices

1. **Content Management**
   - Re-crawl website content weekly
   - Implement incremental updates
   - Monitor for broken links

2. **Performance Optimization**
   - Cache frequent queries
   - Use async processing
   - Implement connection pooling

3. **User Experience**
   - Provide typing indicators
   - Show suggested questions
   - Implement conversation history

## Conclusion

This architecture provides a flexible, scalable solution for integrating intelligent chatbots into websites. Choose between cloud and self-hosted options based on your specific requirements for cost, control, and privacy. 
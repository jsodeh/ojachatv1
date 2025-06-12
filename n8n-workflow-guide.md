# OjaChat n8n Workflow Guide

## Overview
This guide details how to create and integrate n8n workflows with OjaChat, focusing on the communication flow between the application and n8n, the processing of data, and the expected response formats.

## 1. Input Processing

### 1.1 Webhook Configuration
```typescript
// Expected webhook payload structure
interface WebhookPayload {
  message: string;           // User's message
  context: {
    conversationId?: string; // Optional conversation ID
    userId: string;         // User's ID
    sessionId: string;      // Current session ID
    metadata?: {           // Optional metadata
      [key: string]: any;
    };
  };
}
```

### 1.2 Input Validation Node
- Use the "Function" node to validate incoming data
- Check for required fields
- Sanitize input
- Example validation code:
```javascript
if (!input.message || !input.context?.userId) {
  throw new Error('Missing required fields');
}
```

## 2. Core Processing Components

### 2.1 RAG (Retrieval-Augmented Generation)
```typescript
interface RAGConfig {
  model: string;           // e.g., "gpt-4"
  temperature: number;     // 0-1
  maxTokens: number;       // Maximum response length
  stream: boolean;         // Enable streaming
}
```

#### 2.1.1 Document Processing
- Use "Google Drive" node for document ingestion
- "Extract Document Text" node for content extraction
- "Embeddings" node for vector creation
- "Supabase" node for vector storage

#### 2.1.2 Query Processing
- "OpenAI Chat Model" node for response generation
- "Postgres Chat Memory" node for conversation history
- "Function" node for response formatting

### 2.2 Streaming Response
```typescript
interface StreamingResponse {
  message: string;           // Current message chunk
  processUpdates: {         // Real-time updates
    type: 'process_update';
    status: 'started' | 'in_progress' | 'completed';
    message: string;
  }[];
  components: {            // UI components
    type: string;
    data: any;
  }[];
  conversationSummary?: string; // Optional summary
}
```

## 3. Tool Integration

### 3.1 Product Search
```typescript
interface ProductSearchConfig {
  query: string;
  filters?: {
    category?: string;
    priceRange?: [number, number];
    availability?: boolean;
  };
}
```

### 3.2 Cart Management
```typescript
interface CartOperation {
  type: 'add' | 'remove' | 'update' | 'clear';
  productId: string;
  quantity?: number;
}
```

### 3.3 Checkout Process
```typescript
interface CheckoutData {
  orderId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalAmount: number;
  items: CartItem[];
}
```

## 4. Response Handling

### 4.1 Standard Response Format
```typescript
interface StandardResponse {
  success: boolean;
  data: {
    message: string;
    components?: UIComponent[];
    metadata?: {
      [key: string]: any;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}
```

### 4.2 UI Components
```typescript
interface UIComponent {
  type: 'product_card' | 'cart_summary' | 'checkout_form' | 'process_update';
  data: {
    // Component-specific data
    [key: string]: any;
  };
}
```

## 5. Error Handling

### 5.1 Error Types
```typescript
enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PROCESSING_ERROR = 'PROCESSING_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR'
}
```

### 5.2 Error Response Format
```typescript
interface ErrorResponse {
  success: false;
  error: {
    type: ErrorType;
    code: string;
    message: string;
    details?: any;
  };
}
```

## 6. Best Practices

### 6.1 Workflow Structure
1. Start with input validation
2. Process through RAG system
3. Apply business logic
4. Format response
5. Handle errors

### 6.2 Performance Optimization
- Use caching for frequent queries
- Implement rate limiting
- Optimize document processing
- Use streaming for long responses

### 6.3 Security Considerations
- Validate all inputs
- Sanitize outputs
- Implement proper authentication
- Handle sensitive data appropriately

## 7. Testing

### 7.1 Test Cases
1. Basic message processing
2. Document retrieval
3. Product search
4. Cart operations
5. Checkout process
6. Error handling
7. Streaming responses

### 7.2 Test Data
```typescript
const testPayloads = {
  basicMessage: {
    message: "Hello, how can I help you?",
    context: {
      userId: "test-user",
      sessionId: "test-session"
    }
  },
  productSearch: {
    message: "Find me a red shirt",
    context: {
      userId: "test-user",
      sessionId: "test-session",
      metadata: {
        intent: "product_search"
      }
    }
  }
};
```

## 8. Monitoring and Logging

### 8.1 Key Metrics
- Response time
- Error rates
- Resource usage
- User engagement

### 8.2 Logging Format
```typescript
interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  context: {
    workflowId: string;
    nodeId: string;
    userId?: string;
    [key: string]: any;
  };
}
```

## 9. Deployment

### 9.1 Environment Configuration
```typescript
interface EnvironmentConfig {
  n8n: {
    baseUrl: string;
    webhookUrl: string;
    apiKey: string;
  };
  openai: {
    apiKey: string;
    model: string;
  };
  supabase: {
    url: string;
    key: string;
  };
}
```

### 9.2 Deployment Checklist
1. Configure environment variables
2. Set up authentication
3. Test webhook endpoints
4. Verify error handling
5. Monitor initial requests

## 10. Maintenance

### 10.1 Regular Tasks
- Monitor error logs
- Update document embeddings
- Clean up old conversations
- Optimize workflow performance

### 10.2 Update Procedures
1. Backup current workflow
2. Test in staging environment
3. Deploy to production
4. Monitor for issues
5. Rollback if necessary 
Review implementations for
- `/api/asunder/openPrompt`
- `/api/cutr/llmRouter`

Provide plan to Implement: 

POST: `/api/cutr/customPrompt`

```
{
	"promptId": string,
	"promptVersion": number,
	"stream": boolean,
	"payload": <any>object,
	"file": file,
	"traceId": string
}
```

Must be:
- must be form-data
	- OpenAI Multipart Attachment 
- file attachment must be optional
- must support {{API_BEARER_TOKEN}} (only security measure)

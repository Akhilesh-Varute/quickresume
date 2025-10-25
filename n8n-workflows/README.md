# QuickResume n8n Workflows

## Setup Instructions

### Prerequisites
- n8n installed (self-hosted or cloud)
- AWS Bedrock access with credentials
- Claude model access

### Installation

1. **Install n8n:**

npm install -g n8n
OR

docker run -p 5678:5678 n8nio/n8n

text

2. **Import Workflow:**
- Open n8n (http://localhost:5678)
- Go to Workflows → Import from File
- Select `quickresume-workflow.json`

3. **Configure Credentials:**
- Add AWS credentials for Bedrock
- Set up webhook URLs
- Configure CORS settings

4. **Activate Workflow:**
- Toggle the workflow to "Active"
- Test the webhooks

### API Endpoints

**Save Profile:**

POST http://localhost:5678/webhook/save-profile

text

**Generate Resume:**

POST http://localhost:5678/webhook/generate-resume

text

**Get Profile:**

GET http://localhost:5678/webhook/get-profile

text

### Environment Variables

Create `.env` file in n8n directory:

AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
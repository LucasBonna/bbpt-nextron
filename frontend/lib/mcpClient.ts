import { Anthropic } from "@anthropic-ai/sdk";
import type { MessageParam, Tool } from "@anthropic-ai/sdk/resources";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

// Singleton pattern to maintain connection across requests
let mcpClientInstance: MCPClient | null = null;

export class MCPClient {
  public mcp: Client;
  private anthropic: Anthropic;
  public transport: SSEClientTransport;
  private tools: Tool[] = [];
  private isConnected: boolean = false;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || "",
    });
    
    this.mcp = new Client(
      {
        name: "nextjs-chat",
        version: "0.0.1",
      },
      {
        capabilities: {},
      }
    );

    this.transport = new SSEClientTransport(
      new URL(process.env.MCP_SERVER_URL || "http://localhost:8000/connection")
    );
  }

  async connectToMCPServer() {
    if (this.isConnected) return;
    
    await this.mcp.connect(this.transport);
    const toolsResult = await this.mcp.listTools();
    this.tools = toolsResult.tools.map((tool) => {
      return {
        name: tool.name,
        description: tool.description,
        input_schema: {
          type: "object",
          ...tool.inputSchema
        }
      };
    });

    this.isConnected = true;
    console.log("Connected to MCP server with tools:", this.tools);
  }

  async processQuery(query: string, chatHistory: MessageParam[] = []) {
    await this.connectToMCPServer();

    const messages: MessageParam[] = [
      ...chatHistory,
      {
        role: "user",
        content: query,
      },
    ];

    const response = await this.anthropic.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 4000,
      messages,
      tools: this.tools,
    });

    const finalText = [];
    const toolResults = [];

    for (const content of response.content) {
      if (content.type === "text") {
        finalText.push(content.text);
      } else if (content.type === "tool_use") {
        const toolName = content.name;
        const toolArgs = content.input as { [x: string]: unknown } | undefined;

        const result = await this.mcp.callTool({
          name: toolName,
          arguments: toolArgs,
        });
        
        toolResults.push(result);
        finalText.push(
          `[Tool ${toolName} called with args: ${JSON.stringify(toolArgs)}]`
        );

        messages.push({
          role: "assistant",
          content: [
            { type: "tool_use", name: toolName, input: toolArgs || {}, id: content.id }
          ],
        });
        
        messages.push({
          role: "user",
          content: [
            { 
              type: "tool_result", 
              tool_use_id: content.id,
              content: result.content as string
            }
          ],
        });

        const continueResponse = await this.anthropic.messages.create({
          model: "claude-3-5-sonnet-latest",
          max_tokens: 1000,
          messages
        });

        finalText.push(
          continueResponse.content[0].type === "text" 
            ? continueResponse.content[0].text 
            : ""
        );
      }
    }

    return {
      text: finalText.join("\n"),
      toolResults,
      messages,
    };
  }
}

// Singleton getter
export function getMCPClient(): MCPClient {
  if (!mcpClientInstance) {
    mcpClientInstance = new MCPClient();
  }
  return mcpClientInstance;
}

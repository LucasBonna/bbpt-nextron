import { Anthropic } from "@anthropic-ai/sdk";
import type { MessageParam, Tool } from "@anthropic-ai/sdk/resources";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { Client as ClientSelected} from "@/components/client-selector";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

let mcpClientInstance: MCPClient | null = null;

export class MCPClient {
  public mcp: Client;
  private anthropic: Anthropic;
  public transport: SSEClientTransport;
  private tools: Tool[] = [];
  private isConnected: boolean = false;
  private resources: any[] = [];

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
      new URL(process.env.MCP_SERVER_URL || "http://localhost:8000/connection"),
      {
        eventSourceInit: {
          fetch: (url, init) => {
            const modifiedInit = {
              ...init,
              headers: {
                ...init.headers,
                'Authorization': `Bearer ${process.env.MCP_API_KEY}`,
              }
            };
            return fetch(url, modifiedInit);
          }
        },
        requestInit: {
          headers: {
            'Authorization': `Bearer ${process.env.MCP_API_KEY}`,
          }
        }
      }
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

    const resourcesResult = await this.mcp.listResources();
    this.resources = resourcesResult.resources;

    this.isConnected = true;
    console.log("Connected to MCP server with tools:", this.tools);
    console.log("Fetched resources:", this.resources);
  }

  async processMessage(prompt: string, clientSelected: ClientSelected | null, chatHistory: MessageParam[] = []) {
    await this.connectToMCPServer();

    const systemPrompt = `
      Você e um assistente da empresa ByeByePaper, uma empresa de TI focada em solucoes fiscais.
      Você deve responder as perguntas do usuario de forma clara e objetiva.
      Você deve usar as ferramentas disponiveis para responder as perguntas do usuario.
      Sua funcao e responder as perguntas do usuario relacionadas a como funciona o sistema de cada cliente e usar as 
      ferramentas disponiveis, ou os resources para responder as perguntas do usuario.
      O usuario pode perguntar sobre o sistema de cada cliente, sobre as ferramentas disponiveis e sobre o sistema em geral.

      ${clientSelected ? `O cliente atual e o ${clientSelected.name},` : 'Nenhum cliente selecionado.'}
      ${clientSelected ? `O clientId atual e ${clientSelected.id}` : 'Nenhum clientId disponivel.'}
    `;

    const messages: MessageParam[] = [
      ...chatHistory,
      {
        role: "user",
        content: prompt,
      },
    ];

    if (clientSelected) {
      const resourceUri = `resource://${clientSelected.name.toLowerCase()}`;
      try {
        const resource = await this.mcp.readResource({ uri: resourceUri });
        if (resource && resource.contents && resource.contents.length > 0) {
          messages.unshift({
            role: "user",
            content: [{
              type: "tool_result",
              tool_use_id: "client_resource_context",
              content: resource.contents[0].text as string || "",
            }],
          });
           messages.unshift({
            role: "assistant",
            content: [{
              type: "tool_use",
              name: "readResource",
              input: { uri: resourceUri },
              id: "client_resource_context"
            }],
          });
          console.log(`Added resource ${resourceUri} content to messages.`);
        } else {
          console.log(`Resource ${resourceUri} found but has no content or invalid format.`);
        }
      } catch (error) {
        console.error(`Failed to read resource ${resourceUri}:`, error);
         messages.unshift({
            role: "user",
            content: [{
              type: "tool_result",
              tool_use_id: "client_resource_context",
              content: `Error: Failed to load resource ${resourceUri}.` as string,
            }],
          });
           messages.unshift({
            role: "assistant",
            content: [{
              type: "tool_use",
              name: "readResource",
              input: { uri: resourceUri },
              id: "client_resource_context"
            }],
          });
      }
    }

    const response = await this.anthropic.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 4000,
      system: systemPrompt,
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

export function getMCPClient(): MCPClient {
  if (!mcpClientInstance) {
    mcpClientInstance = new MCPClient();
  }
  return mcpClientInstance;
}

import { describe, expect, test } from "bun:test"
import { MCP } from "@opencode-ai/core/mcp/index"
import { MCPClient } from "@opencode-ai/core/mcp/client"

describe("MCP errors", () => {
  test("expose useful messages", () => {
    expect(new MCP.NotFoundError({ server: MCP.ServerName.make("demo") }).message).toBe("MCP server not found: demo")
    expect(new MCP.ToolCallError({ server: MCP.ServerName.make("demo"), tool: "search", message: "failed" }).message).toBe(
      "failed",
    )
    expect(new MCPClient.NeedsAuthError({ server: "demo" }).message).toBe("MCP server requires authentication: demo")
    expect(new MCPClient.ConnectError({ server: "demo", message: "offline" }).message).toBe("offline")
  })
})

describe("MCP remote headers", () => {
  test("resolve environment placeholders", () => {
    const previous = process.env.OPENCODE_TEST_MCP_TOKEN
    const missing = process.env.OPENCODE_TEST_MCP_MISSING
    try {
      process.env.OPENCODE_TEST_MCP_TOKEN = "secret"
      delete process.env.OPENCODE_TEST_MCP_MISSING

      expect(
        MCPClient.resolveHeaders({
          Authorization: "Bearer {env:OPENCODE_TEST_MCP_TOKEN}",
          Missing: "prefix-{env:OPENCODE_TEST_MCP_MISSING}-suffix",
        }),
      ).toEqual({ Authorization: "Bearer secret", Missing: "prefix--suffix" })
    } finally {
      if (previous === undefined) delete process.env.OPENCODE_TEST_MCP_TOKEN
      else process.env.OPENCODE_TEST_MCP_TOKEN = previous

      if (missing === undefined) delete process.env.OPENCODE_TEST_MCP_MISSING
      else process.env.OPENCODE_TEST_MCP_MISSING = missing
    }
  })
})

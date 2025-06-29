const handler = require("../api/index");
const { test, expect, describe, beforeEach } = require("@jest/globals");

// Mock response object for testing
const createMockResponse = () => {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader: function(key, value) {
      this.headers[key] = value;
    },
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    send: function(data) {
      this.body = data;
      return this;
    },
    end: function() {
      return this;
    }
  };
  return res;
};

describe('Bandwidth Hero Proxy API', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = createMockResponse();
  });

  test("handler returns service identification when no parameters provided", async () => {
    const mockReq = {
      method: 'GET',
      query: {},
      headers: {}
    };

    await handler(mockReq, mockRes);

    expect(mockRes.statusCode).toBe(200);
    expect(mockRes.body).toBe("Bandwidth Hero Data Compression Service");
  });

  test("handler returns 400 when url parameter is missing", async () => {
    const mockReq = {
      method: 'GET',
      query: { w: '800', q: '80' },
      headers: {}
    };

    await handler(mockReq, mockRes);

    expect(mockRes.statusCode).toBe(400);
    expect(mockRes.body).toBe('Missing "url" parameter');
  });

  test("handler returns 400 when width parameter is invalid", async () => {
    const mockReq = {
      method: 'GET',
      query: { url: 'https://example.com/image.jpg', w: 'invalid', q: '80' },
      headers: {}
    };

    await handler(mockReq, mockRes);

    expect(mockRes.statusCode).toBe(400);
    expect(mockRes.body).toBe('Invalid "w" (width) parameter. Must be between 1 and 8192');
  });

  test("handler returns 400 when quality parameter is invalid", async () => {
    const mockReq = {
      method: 'GET',
      query: { url: 'https://example.com/image.jpg', w: '800', q: '150' },
      headers: {}
    };

    await handler(mockReq, mockRes);

    expect(mockRes.statusCode).toBe(400);
    expect(mockRes.body).toBe('Invalid "q" (quality) parameter. Must be between 10 and 100');
  });

  test("handler handles OPTIONS requests for CORS", async () => {
    const mockReq = {
      method: 'OPTIONS',
      query: {},
      headers: {}
    };

    await handler(mockReq, mockRes);

    expect(mockRes.statusCode).toBe(200);
    expect(mockRes.headers['Access-Control-Allow-Origin']).toBe('*');
  });

  test("handler sets proper CORS headers", async () => {
    const mockReq = {
      method: 'GET',
      query: {},
      headers: {}
    };

    await handler(mockReq, mockRes);

    expect(mockRes.headers['Access-Control-Allow-Origin']).toBe('*');
    expect(mockRes.headers['Access-Control-Allow-Methods']).toBe('GET, POST, OPTIONS');
  });
});

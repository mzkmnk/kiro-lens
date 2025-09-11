import { TestBed } from "@angular/core/testing";
import { ConfigService } from "./config.service";

describe("ConfigService", () => {
  let service: ConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConfigService],
    });
    service = TestBed.inject(ConfigService);
  });

  describe("apiUrl", () => {
    it("should return API URL signal", () => {
      const apiUrl = service.apiUrl();
      expect(typeof apiUrl).toBe("string");
      expect(apiUrl).toContain("http");
    });
  });

  describe("isProduction", () => {
    it("should return production flag signal", () => {
      const isProduction = service.isProduction();
      expect(typeof isProduction).toBe("boolean");
    });
  });

  describe("logLevel", () => {
    it("should return log level signal", () => {
      const logLevel = service.logLevel();
      expect(["debug", "info", "warn", "error"]).toContain(logLevel);
    });
  });

  describe("version", () => {
    it("should return version signal", () => {
      const version = service.version();
      expect(typeof version).toBe("string");
      expect(version.length).toBeGreaterThan(0);
    });
  });

  describe("enableMSW", () => {
    it("should return MSW enable flag signal", () => {
      const enableMSW = service.enableMSW();
      expect(typeof enableMSW).toBe("boolean");
    });
  });

  describe("updateApiUrl", () => {
    it("should update API URL", () => {
      const newUrl = "http://localhost:4000";
      service.updateApiUrl(newUrl);
      expect(service.apiUrl()).toBe(newUrl);
    });
  });

  describe("updateLogLevel", () => {
    it("should update log level", () => {
      const newLevel = "warn" as const;
      service.updateLogLevel(newLevel);
      expect(service.logLevel()).toBe(newLevel);
    });
  });

  describe("getConfig", () => {
    it("should return complete config object", () => {
      const config = service.getConfig();
      expect(config).toEqual({
        apiUrl: service.apiUrl(),
        isProduction: service.isProduction(),
        logLevel: service.logLevel(),
        version: service.version(),
        enableMSW: service.enableMSW(),
      });
    });
  });
});

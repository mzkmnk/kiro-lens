import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { errorInterceptor } from "./error.interceptor";

describe("ErrorInterceptor", () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should pass through successful requests", () => {
    const testData = { message: "success" };

    httpClient.get("/test").subscribe((data) => {
      expect(data).toEqual(testData);
    });

    const req = httpMock.expectOne("/test");
    req.flush(testData);
  });

  it("should handle 400 Bad Request error", () => {
    httpClient.get("/test").subscribe({
      next: () => fail("should have failed"),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(400);
        expect(error.error.message).toBe("Bad Request");
      },
    });

    const req = httpMock.expectOne("/test");
    req.flush(
      { message: "Bad Request" },
      { status: 400, statusText: "Bad Request" },
    );
  });

  it("should handle 401 Unauthorized error", () => {
    httpClient.get("/test").subscribe({
      next: () => fail("should have failed"),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(401);
        expect(error.error.message).toBe("Unauthorized");
      },
    });

    const req = httpMock.expectOne("/test");
    req.flush(
      { message: "Unauthorized" },
      { status: 401, statusText: "Unauthorized" },
    );
  });

  it("should handle 404 Not Found error", () => {
    httpClient.get("/test").subscribe({
      next: () => fail("should have failed"),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(404);
        expect(error.error.message).toBe("Not Found");
      },
    });

    const req = httpMock.expectOne("/test");
    req.flush(
      { message: "Not Found" },
      { status: 404, statusText: "Not Found" },
    );
  });

  it("should handle 500 Internal Server Error", () => {
    httpClient.get("/test").subscribe({
      next: () => fail("should have failed"),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(500);
        expect(error.error.message).toBe("Internal Server Error");
      },
    });

    const req = httpMock.expectOne("/test");
    req.flush(
      { message: "Internal Server Error" },
      { status: 500, statusText: "Internal Server Error" },
    );
  });

  it("should handle network error", () => {
    httpClient.get("/test").subscribe({
      next: () => fail("should have failed"),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(0);
        expect(error.error.message).toBe("ネットワークエラーが発生しました");
      },
    });

    const req = httpMock.expectOne("/test");
    req.error(new ProgressEvent("Network error"));
  });
});

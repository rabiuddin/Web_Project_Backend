class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }

  static get Builder() {
    return new ApiResponseBuilder();
  }
}

class ApiResponseBuilder {
  constructor() {
    this._statusCode = 200;
    this._data = null;
    this._message = "Success";
  }

  statusCode(statusCode) {
    this._statusCode = statusCode;
    return this;
  }

  data(data) {
    this._data = data;
    return this;
  }

  message(message) {
    this._message = message;
    return this;
  }

  build() {
    return new ApiResponse(this._statusCode, this._data, this._message);
  }
}

export { ApiResponse }; // Add this export statement

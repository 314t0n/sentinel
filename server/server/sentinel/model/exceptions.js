function MissingParameterError(message) {
    this.name = "MissingParameterError";
    this.message = (message || "");
}
MissingParameterError.prototype = Error.prototype;

exports.MissingParameterError = MissingParameterError;
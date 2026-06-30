export function getSafeErrorMessage(error: unknown, fallback = "Something went wrong.") {
  if (process.env.NODE_ENV === "development" && error instanceof Error) {
    return error.message;
  }

  return fallback;
}


export interface CommandHandler<TRequest, TResponse> {
    Handle(request: TRequest): TResponse;
}

export interface AsyncCommandHandler<TRequest, TResponse> {
    HandleAsync(request: TRequest): Promise<TResponse>;
}
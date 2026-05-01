import { Component, type ReactNode, type ErrorInfo } from "react";

type State = { error: Error | null; info: ErrorInfo | null };

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error): State {
    return { error, info: null };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
    this.setState({ error, info });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="m-4 rounded border border-red-300 bg-red-50 p-4 font-mono text-xs text-red-900">
          <div className="mb-2 text-sm font-bold">Render error</div>
          <div className="mb-2 whitespace-pre-wrap break-words">
            {this.state.error.message}
          </div>
          {this.state.error.stack && (
            <pre className="mb-2 max-h-64 overflow-auto whitespace-pre-wrap">
              {this.state.error.stack}
            </pre>
          )}
          {this.state.info?.componentStack && (
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap">
              {this.state.info.componentStack}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

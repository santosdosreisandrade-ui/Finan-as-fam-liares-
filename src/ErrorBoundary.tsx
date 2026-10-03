import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', backgroundColor: '#fff', height: '100vh', overflow: 'auto' }}>
          <h2>Algo deu errado (App Crash)</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Clique para ver os detalhes do erro (Por favor, copie e me envie)</summary>
            <br />
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button 
            onClick={() => {
                localStorage.removeItem('financas_familia_data');
                window.location.reload();
            }}
            style={{ marginTop: '20px', padding: '10px', background: 'red', color: 'white', border: 'none', borderRadius: '5px' }}
          >
            Resetar App (Apagar Local Storage)
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

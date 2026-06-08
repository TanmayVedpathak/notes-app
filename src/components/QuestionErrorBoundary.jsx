import React from "react";

export class QuestionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error) {
    console.error("Error rendering question:", {
      questionId: this.props.questionId || "unknown",
      error,
    });
  }

  render() {
    if (this.state.hasError) {
      return null; // skip this broken item
    }

    return this.props.children;
  }
}

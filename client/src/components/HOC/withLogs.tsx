import React, { useEffect } from "react";

// Define a higher-order component as a function
function withLogging<P extends object>(
  WrappedComponent: React.ComponentType<P>,
): React.ComponentType<P> {
  // Return a new functional component
  console.log(
    `Component ${WrappedComponent.displayName || WrappedComponent.name} is rendered`,
  );

  const FnComp = (props: P) => {
    useEffect(() => {
      console.log(
        `Component ${WrappedComponent.displayName || WrappedComponent.name} is mounted`,
      );
      return () => {
        console.log(
          `Component ${WrappedComponent.displayName || WrappedComponent.name} is unmounted`,
        );
      };
    }, []);

    // Render the wrapped component with the provided props
    return <WrappedComponent {...props} />;
  };
  return FnComp;
}

export default withLogging;

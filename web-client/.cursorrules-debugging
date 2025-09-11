# React Debugging Expert Standards

## Debugging Philosophy

- **Expert Debugger**: Act as a specialized React debugging expert when troubleshooting issues
- **Systematic Approach**: Use methodical debugging techniques to identify and resolve problems
- **Clear Communication**: Provide precise, actionable debugging guidance

## Logging Standards

### Log Format Requirements

**MANDATORY**: All debugging logs must follow this exact format:

```
<function_name>: <rest_of_log_message>
```

**Examples:**

- `useShiftManagerInitialization: Starting initialization process`
- `handleUserSubmit: Received form data with 3 fields`
- `calculateShiftDuration: Input validation failed for startTime`
- `ShiftManager: Rendering with 15 staff members`

### Logging Rules

1. **Function Prefix**: Every log statement must start with the function name followed by a colon and space
2. **Clear Context**: Include relevant context about what's happening in the function
3. **No Emojis**: Absolutely no emojis of any kind in log messages
4. **Descriptive Messages**: Provide meaningful information about the current state or action
5. **Consistent Format**: Always use the `<function_name>: <message>` pattern

### Implementation Examples

**Good Examples:**

```javascript
// In a React component
const ShiftManager = () => {
  console.log("ShiftManager: Component initializing");
  console.log("ShiftManager: Received props with postId:", postId);

  const handleSave = () => {
    console.log("handleSave: Starting save operation");
    console.log("handleSave: Validating form data");
  };
};

// In a service function
const calculateShiftHours = (startTime, endTime) => {
  console.log("calculateShiftHours: Processing time range", {
    startTime,
    endTime,
  });
  console.log("calculateShiftHours: Validation completed successfully");
};

// In a hook
const useShiftOptimization = () => {
  console.log("useShiftOptimization: Hook initializing");
  console.log("useShiftOptimization: Dependencies updated, recalculating");
};
```

**Bad Examples:**

```javascript
// Missing function name prefix
console.log("Starting process"); // ❌

// Using emojis
console.log("handleSave: Process completed! 🎉"); // ❌

// Inconsistent format
console.log("In function handleSave: doing something"); // ❌
```

## Debugging Workflow

### When Investigating Issues

1. **Add Strategic Logs**: Place logs at key points in the execution flow
2. **Track Data Flow**: Log data transformations and state changes
3. **Identify Patterns**: Look for patterns in console output to identify root causes
4. **Verify Assumptions**: Use logs to validate assumptions about code behavior

### Log Placement Strategy

- **Function Entry**: Log when entering functions with relevant parameters
- **State Changes**: Log before and after state modifications
- **API Calls**: Log request/response data for external calls
- **Error Boundaries**: Log error contexts and recovery attempts
- **Conditional Logic**: Log which branches are taken in complex conditionals

### Debugging Best Practices

1. **Temporary Logs**: Add debugging logs temporarily during development
2. **Clean Up**: Remove debugging logs before committing code
3. **Production Logs**: Use proper logging levels for production environments
4. **Performance**: Be mindful of log volume in performance-critical sections

## Integration with Existing Standards

- **Follow All Other Rules**: This debugging rule supplements existing development standards
- **Code Quality**: Maintain code quality while adding debugging capabilities
- **Testing**: Ensure debugging logs don't interfere with automated tests
- **Documentation**: Document complex debugging scenarios for team knowledge

## Console Output Monitoring

- **Always Check**: Review console output after making changes
- **Error Investigation**: Investigate all console errors and warnings
- **Pattern Recognition**: Look for unexpected patterns in log output
- **Performance Impact**: Monitor for performance issues in logging-heavy sections

## Debugging Tools Integration

- **React DevTools**: Use in conjunction with console logging
- **Browser DevTools**: Leverage browser debugging capabilities
- **Source Maps**: Ensure proper source map configuration for debugging
- **Network Tab**: Monitor network requests alongside application logs


# Paperless-ngx Regex Guide

This guide provides examples and explanations for creating regex patterns in Paperless-ngx for document tagging and matching.

## Basic Concepts

- Paperless-ngx supports regular expressions for document matching
- Case sensitivity can be toggled in the settings
- Patterns are used to match text in document content or metadata

## Common Pattern Elements

### Basic Matching

- `word` - Matches the exact word "word"
- `word1|word2` - Matches either "word1" or "word2"
- `\s` - Matches any whitespace character
- `\s+` - Matches one or more whitespace characters

### Excluding Patterns

- `(?!pattern)` - Negative lookahead, excludes what follows
- `(?:pattern)` - Non-capturing group, useful for grouping without capturing

## Practical Examples

### Excluding Specific Phrases

To match a word but exclude it when followed by specific text:

```
word(?!\sunwanted)
```

This matches "word" but not "word unwanted"

### Multiple Exclusions

To exclude multiple specific phrases:

```
word(?!\s(?:unwanted1|unwanted2))
```

This matches "word" but not "word unwanted1" or "word unwanted2"

### Complex Matching with Exclusions

Example from our work with K-bin:

```
K-bin(?!\s(?:only|tube))
```

This matches:

- "K-bin"
- "K-bin documents"
- "K-bin files"
  But excludes:
- "K-bin only"
- "K-bin tube"

### Multiple Terms with Exclusions

Example from our work with CpChem/Chevron:

```
(?:cpchem(?!\sonly)|cp\s+chem|chevron(?:\s+phillips)?)
```

This matches:

- "cpchem" (but not "cpchem only")
- "cp chem" (with flexible spacing)
- "chevron"
- "chevron phillips"

## Best Practices

1. **Test Incrementally**

   - Start with simple patterns
   - Add complexity gradually
   - Test each change

2. **Consider Spacing**

   - Use `\s+` for flexible spacing between words
   - Account for different types of whitespace

3. **Case Sensitivity**

   - Be aware of your case sensitivity setting
   - Use appropriate case in your patterns

4. **Grouping**

   - Use `(?:...)` for grouping without capturing
   - Use `(...)` for capturing groups when needed

5. **Exclusions**
   - Use negative lookahead `(?!...)` for excluding specific patterns
   - Be specific about what follows the excluded pattern

## Troubleshooting

If your pattern isn't working as expected:

1. Check for proper spacing in the pattern
2. Verify case sensitivity settings
3. Test the pattern with simple examples first
4. Break down complex patterns into smaller parts
5. Use Paperless-ngx's testing feature to verify matches

## Additional Resources

- [Python Regex Documentation](https://docs.python.org/3/library/re.html)
- [Paperless-ngx Documentation](https://docs.paperless-ngx.com/)

I'm using paperless ngx and i'm trying to see if it would support NOT logic with tag matching. It has support for regular expressions, would that be a way to implement NOT logic?
https://docs.paperless-ngx.com/advanced_usage/#matching

Edit
I see you're looking for ways to implement NOT logic with tag matching in Paperless-ngx, particularly using its regular expression support. Let me help you with this.

Based on the Paperless-ngx documentation about matching, yes, you can implement NOT logic using regular expressions. When creating document matching rules, Paperless-ngx allows you to use regular expressions in the match field.

For NOT logic with tags, you can use negative lookahead assertions in your regular expressions. Here's how you would do it:

In the match field of your rule, use a regex pattern with negative lookahead: ^(?!._TAG_NAME)._$
This pattern means:

^ - Start of the string
(?!._TAG_NAME) - Negative lookahead that asserts the string doesn't contain "TAG_NAME"
._$ - Match the rest of the string to the end
For example, if you want to match documents that do NOT have the tag "Invoice", you would use: ^(?!._Invoice)._$

This would match any document that doesn't have "Invoice" in its tag list.

You can also combine multiple negative conditions: ^(?!.*Invoice)(?!.*Receipt).\*$

This would match documents that have neither "Invoice" nor "Receipt" tags.

Would you like me to provide more complex examples or explain how to combine this with other matching criteria in Paperless-ngx?

the NOT string would be "K-Bin only", but then I'd still want to match other instances where "K-Bin" isn't followed by "only"

Edit
I understand what you're trying to do. You want to exclude matches for the specific phrase "K-Bin only" but still match other instances where "K-Bin" appears without being followed by "only". This is a perfect use case for regular expressions.

In Paperless-ngx's matching rules, you could use a regex pattern like this:

^(?!.*K-Bin only).*K-Bin.\*$
Let me break down how this works:

^ - Start of the string
(?!.*K-Bin only) - Negative lookahead that ensures "K-Bin only" doesn't appear anywhere
.*K-Bin.\* - Matches strings that contain "K-Bin" somewhere
$ - End of the string
This pattern will:

Match documents with tags like "K-Bin", "K-Bin documents", "Important K-Bin", etc.
NOT match documents with the tag "K-Bin only"
If you're applying this to the tag matching functionality in Paperless-ngx, you would create a rule with:

Match field: Set to the regex pattern above
Matching algorithm: Select "Regular expression"
This should achieve exactly what you're looking for - excluding the specific "K-Bin only" tag while still matching other tags that contain "K-Bin".

OK similar situation. NOT "Lyondell Basell Only" but yes to "Lyondell Basell" or LyondellBasell"

Edit
For this scenario, you want to exclude matches for the specific phrase "Lyondell Basell Only" but still match instances of "Lyondell Basell" or "LyondellBasell". Here's a regex pattern you can use in Paperless-ngx:

^(?!._Lyondell Basell Only)._(?:Lyondell Basell|LyondellBasell).\*$
Let me break down how this works:

^ - Start of the string
(?!._Lyondell Basell Only) - Negative lookahead that ensures "Lyondell Basell Only" doesn't appear anywhere
._ - Match any characters
(?:Lyondell Basell|LyondellBasell) - Non-capturing group that matches either "Lyondell Basell" or "LyondellBasell"
.\* - Match any remaining characters
$ - End of the string
This pattern will:

Match documents with tags like "Lyondell Basell", "LyondellBasell", "Lyondell Basell Invoice", etc.
NOT match documents with the tag "Lyondell Basell Only"
When setting up your rule in Paperless-ngx:

Enter this pattern in the Match field
Make sure to select "Regular expression" as the matching algorithm
This should accomplish what you need - excluding the specific "Lyondell Basell Only" tag while still matching other variations of the Lyondell Basell name.

does this look right for NOT 'if Cpchem but yes to all other?
^(?!.if CpChem).(?:Cp Chem|CpChem|Chevron|Chevron Phillips).\*$`

Edit
Your regex pattern is close, but let me review it to make sure it will do exactly what you want:

^(?!._if CpChem)._(?:Cp Chem|CpChem|Chevron|Chevron Phillips).\*$
This pattern will:

Exclude matches for anything containing "if CpChem"
Match documents with tags containing "Cp Chem", "CpChem", "Chevron", or "Chevron Phillips"
There are a couple of things to consider:

Case sensitivity: If Paperless-ngx matching is case-sensitive, your pattern might not catch "if CPChem" (with a capital P) versus "if CpChem". If you need case-insensitive matching, you might need to adjust your regex or see if Paperless-ngx has a case-insensitive option.
Spacing: Make sure the spacing in "if CpChem" matches exactly how it appears in your tags.
If you want to exclude anything with "if CpChem" (with that exact spacing and case) but include all other instances of the company names, then your pattern looks correct.

If you want to be more thorough, especially with case sensitivity, you might consider:

^(?!._if\s+CpChem)._(?:Cp\s*Chem|CpChem|Chevron|Chevron\s+Phillips).*$
This version:

Uses \s+ to match one or more whitespace characters between "if" and "CpChem"
Uses \s\* to match zero or more whitespace characters between "Cp" and "Chem"
Uses \s+ to match one or more whitespace characters between "Chevron" and "Phillips"
Does this align with what you're trying to accomplish?

in linux, how would I find a specific file with the word "house" in it.

Edit
sorry, "house" in the NAME of the file

Edit
To find files with the word "house" in their name in Linux, you can use several commands. Here are the most straightforward options:

Using find command
This is the most versatile approach:

bash
find /path/to/search -name "_house_"
Replace /path/to/search with the directory you want to search in (use . for current directory)
The _house_ pattern matches any file containing "house" anywhere in the filename
Using ls with grep
For a quick search in the current directory and its subdirectories:

bash
ls -la | grep house
Or to search recursively:

bash
ls -R | grep house
Using locate (if installed and database updated)
If your system has the locate command and its database is updated, this is very fast:

bash
locate house
To narrow down to a specific directory:

bash
locate house | grep /path/to/search
Case-insensitive search
If you want to find files regardless of case (House, HOUSE, house, etc.):

bash
find /path/to/search -iname "_house_"
The -iname option makes the search case-insensitive.

Which approach would work best for your specific situation?

^(?!._Lyondell Basell Only)._(?:Lyondell Basell|LyondellBasell).\*$ is not tagging "Lyondell Basell Only" which is correct, but is also not tagging the two other stringst that should be tagged

Edit
I see the issue. Let's troubleshoot your regex pattern:

^(?!._Lyondell Basell Only)._(?:Lyondell Basell|LyondellBasell).\*$
The problem might be in how Paperless-ngx processes the regular expression or how the pattern is interacting with the content being matched. Let me suggest a few possible fixes:

1. Simplify the regex first to confirm basic matching works
   Try this simpler pattern first to confirm that basic matching works:

(?:Lyondell Basell|LyondellBasell)
This should match both "Lyondell Basell" and "LyondellBasell" without any exclusions.

2. Check for spacing or invisible characters
   The issue might be related to spaces or invisible characters. Try:

^(?!._Lyondell\s+Basell\s+Only)._(?:Lyondell\s+Basell|LyondellBasell).\*$
Here \s+ matches one or more whitespace characters, which could help if there are different types of spaces or multiple spaces.

3. Try a different approach with negative lookbehind
   ^._(?:(?<!Only\s)Lyondell Basell|LyondellBasell)._$
   This pattern uses a negative lookbehind to ensure "Lyondell Basell" is not preceded by "Only ".

4. Most simplified alternative approach
   If the regex engine in Paperless-ngx supports it, you could try two separate rules:

Rule 1: Match LyondellBasell (exact match) Rule 2: Match Lyondell Basell but exclude Lyondell Basell Only

For Rule 2, you could try:

^(?!Lyondell Basell Only$)Lyondell Basell.*$
This pattern specifically excludes the exact phrase "Lyondell Basell Only" while matching "Lyondell Basell" followed by anything else.

Could you try one of these approaches and let me know if it resolves the issue? It would also help to know if one of the patterns is matching but not the other.

here's a hint I found on the website:
PAPERLESS_CONSUMER_TAG_BARCODE_MAPPING=<json dict>
Defines a dictionary of filter regex and substitute expressions.
Syntax: {"<regex>": "<substitute>" [,...]]}
A barcode is considered for tagging if the barcode text matches at least one of the provided pattern.
If a match is found, the rule is applied. This allows very versatile reformatting and mapping of barcode pattern to tag values.
If a tag is not found it will be created.
Defaults to:
{"TAG:(._)": "\\g<1>"} which defines - a regex TAG:(.) which includes barcodes beginning with TAG: followed by any text that gets stored into match group #1 and - a substitute \\g<1> that replaces the original barcode text by the content in match group #1. Consequently, the tag is the barcode text without its TAG: prefix.
More examples:
`{"ASN12.": "JOHN", "ASN13._": "SMITH"} for example maps - ASN12nnnn barcodes to the tag JOHN and - ASN13nnnn barcodes to the tag SMITH.
{"T-J": "JOHN", "T-S": "SMITH", "T-D": "DOE"}` directly maps - T-J barcodes to the tag JOHN, - T-S barcodes to the tag SMITH and - T-D barcodes to the tag DOE.
Please refer to the Python regex documentation for more information.

Edit
This hint is about a different feature of Paperless-ngx: the PAPERLESS_CONSUMER_TAG_BARCODE_MAPPING setting is specifically for mapping barcodes to tags during document consumption (when documents are first added to the system).

What you're working with is the document matching rules system, which is used for automatically tagging documents based on their content or metadata after they're in the system.

Let's refocus on your regex issue with "Lyondell Basell" matching. The problem might be related to how Paperless-ngx handles the regex syntax. Let's try a simpler approach:

Approach using two separate rules:
First rule for "LyondellBasell":
Match: LyondellBasell
Algorithm: Exact match (or regex if you prefer)
Second rule for "Lyondell Basell" but not "Lyondell Basell Only":
Match: Lyondell Basell(?! Only)
Algorithm: Regular expression
The pattern Lyondell Basell(?! Only) says "match Lyondell Basell only if it's not immediately followed by the word Only".

If the document matching system in Paperless-ngx doesn't process complex expressions well, this split into two separate rules might work better.

Alternative single regex approach:
If you still want to use a single regex rule, try this simpler version:

Lyondell Basell(?! Only)|LyondellBasell
This says "match either 'Lyondell Basell' not followed by 'Only', or match 'LyondellBasell'".

The advantage of this approach is that it avoids the complex beginning and ending anchors (^ and $) that might be causing issues with the matching engine.

Would you like to try one of these approaches?

ok this new format is working

Edit
Great to hear the new format is working! This simpler approach of using:

Lyondell Basell(?! Only)|LyondellBasell
Is much more straightforward and avoids potential complications with anchors and complex lookaheads.

For your other tag patterns, you can follow the same approach:

For the CpChem case:
(?:Cp Chem|CpChem|Chevron|Chevron Phillips)(?! if CpChem)
or if the "if" always comes before:

(?!if CpChem)(?:Cp Chem|CpChem|Chevron|Chevron Phillips)
For the K-Bin case:
K-Bin(?! only)
The pattern X(?! Y) means "match X only when it's not immediately followed by Y", which is perfect for these kinds of exclusions.

This approach is not only more reliable but also more readable and easier to maintain in the long run. If you need any other regex patterns for similar cases, feel free to ask!

^(?!.exxon plastic).exxon.\*$

Edit
Let me analyze this regex pattern:

^(?!.*exxon plastic).*exxon.\*$
This pattern is designed to:

Exclude matches containing "exxon plastic" (anywhere in the string)
Include matches containing "exxon" (anywhere in the string)
Based on your previous success with simpler patterns, I'd recommend converting this to:

exxon(?! plastic)
However, this might not work exactly as intended because your original pattern would exclude "exxon plastic" regardless of where it appears in the string, whereas exxon(?! plastic) would only exclude "exxon" when it's immediately followed by " plastic".

If you need to exclude "exxon plastic" anywhere in the string but include other instances of "exxon", try this simpler approach:

(?!._exxon plastic._)exxon
Or you could try breaking it into two rules:

Rule to match "exxon":
Match: exxon
Algorithm: Regular expression or contains
Rule to exclude "exxon plastic":
Match: exxon plastic
Algorithm: Contains
Action: Don't assign the tag (set this as a negative rule)
The second approach might be more reliable depending on how Paperless-ngx implements its regex engine. Which would you prefer to try?

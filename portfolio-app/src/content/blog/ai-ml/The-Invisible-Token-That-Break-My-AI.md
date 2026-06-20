---
title: The Invisible Tokens That Broke My AI — And Took Two Debugging Sessions To Find
category: AI & Machine Learning
date: June 13, 2026
draft: false
excerpt: A few weeks ago I wrote about debugging truncated responses from Gemini. I thought I fixed that bug, but a new feature exposed it again. This is what happened next.
---

I thought I was done with this bug. 

A few weeks ago I wrote about debugging truncated responses from Gemini; there we talked about `max_output_token` and `finish_reason` saga. I found the issue, fixed it, set tokens to 500, moved on. Wrote a whole post about it - [The Bug That Taught...](/blog/The-Bug-That-Taught-Me-More-About-LLMs-Than-Any-Tutorial). 

Then I added a new feature - query explanations alongside the SQL. The exact same bug came back. Same cutoff mid-sentence. At 500 tokens it was working fine earlier, but now we are facing the same issue again.

I sat there thinking - Did I not actually fix that last time?

---

## Round Two
My first instinct was that something from the recent changes broke the prompt. I went back and checked all the modules that I touched. Found nothing. 

The code looked correct. The prompt looked correct. It is still the same. Now, the question was if everything is the same, then why is it breaking now and hitting `MAX_TOKENS`?

---

## The Detail I Almost Missed
I added the debugging logging back to print the `finish_reason` and raw response text.

```python
logger.info("Raw insight response: '%s'", response.text)
logger.info("Finish reason: %s", response.candidates[0].finish_reason)
```

The logs:
```
Raw insight response: 'Our top five customers are all high-value individuals, each spending over 1.19'
Finish reason: FinishReason.MAX_TOKENS

```

And here's the part that surprised me. 

That response text is about 40 words. Roughly 20 tokens. My budget was 500.

**How is Gemini hitting the 500 token limit with a 20 token response?**

That doesn't make sense if `max_output_tokens` only counts the text you actually get back, unless it doesn't only count that.

---

## What I Found
The Gemini 2.5 model has something called 'thinking', an internal reasoning phase that happens before the model writes any response. The model thinks through the problem first and then responds back. 

**Thinking token count against `max_output_tokens`**

So, what was actually happening:

```
max_output_tokens: 500
   ↓
-480 tokens spent on invisible internal reasoning
   ↓
-20 tokens left for the actual answer
   ↓
Model starts writing: "Our top five customers are all high-value 
individuals, each spending over 1.19"
   ↓
Budget hits zero mid-sentence
   ↓
finish_reason: MAX_TOKENS

```

The model wasn't being verbose. It was thinking quietly, invisibly, and running out of the room before it could finish telling me what it thought.

---

## Why My Fix "Worked" By Accident

In my first debugging session, I bumped my tokens from 100 -> 200 -> 500 and finalized 500 as it was working perfectly fine. I thought I found the magic number.

What I found was a number large enough that for some specific prompt, it left over some budget to provide the complete insights. 

It wasn't a fix. It was just a large number that happened to be big enough to survive the invisible tax most of the time. Add some more features, improve the prompt, thinking requires more tokens, and 500 is not enough.

---

## The Actual Fix

Turn thinking off. For a task like, "summarize these 5 rows in two sentences," the model doesn't need thinking space. 

```python
from google.genai import types

config = types.GenerateContentConfig(
    temperature=0.4,
    max_output_tokens=500,
    thinking_config=types.ThinkingConfig(thinking_budget=0),
)
```

One line: `thinking_budget=0`.

Ran the sample query again. Boom. 

---

## The Pattern I'm Taking Now

For every LLM call now, I ask myself a question before choosing any token number - Does this task actually need the model to "think"?

Get this right first. Then tune the token limit based on your response text. 

---

App Demo - [https://anubhav-fluxora.streamlit.app/](https://anubhav-fluxora.streamlit.app/)

If you're on a similar learning path, follow along. I write about what actually breaks, not just what works.
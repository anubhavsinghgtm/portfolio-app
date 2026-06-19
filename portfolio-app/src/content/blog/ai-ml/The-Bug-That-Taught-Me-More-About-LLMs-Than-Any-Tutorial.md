---
title: The Bug That Taught Me More About LLMs Than Any Tutorial
category: AI & Machine Learning
date: June 07, 2026
draft: false
excerpt: Debugging my AI analytics assistant Fluxora. The LLM just... stopped. Here's what I learned about prompt engineering, context length, and why LLM debugging is fundamentally different from traditional software.
---


I was so confident.

I had just finished building the insights feature for my AI analytics assistant - [Fluxora](https://anubhav-fluxora.streamlit.app/). You ask a question in plain English, it queries a real database, and then - this was the new part - it explains the results back to you in plain English. Like having a data analyst sitting next to you.

I tested it. Typed "show top 5 customers by total spend." 

The response came back: 
> "The top 5 customers collectively spent over..."

And then nothing.

Just silence. Mid-sentence. Like someone pulled the plug of my data analyst right before they could finish their thought.

---

## My first reaction - Classic developer move

I did what every developer does. I assumed that I knew the problem without even diagnosing it. 

"Oh it's probably the token limit. Let me increase it."

Changed the `max_output_token` from 100 to 200. Deployed. Tested.

> "The top 5 customers collectively spent over..."

Same thing.

Fine. 200 wasn't enough. Bumped it to 500.

> "Our top 5 customers are high-value accounts, each spending over 1.1 million. Vrinda Bhavsar leads this group with a total spend exceeding 1.37 million. This indicates a significant portion of our revenue is concentrated among a few key customers."

Complete. Finally.

I thought I fixed it. Dropped it back to 250 to be "efficient".


> "The top 5 customers collectively spent over..."

Back to square one.

At this point I had no idea what was actually happening. I was just throwing numbers at a problem that I didn't understand.

---

## The Moment I stopped guessing

Here's what changed everything. Instead of changing another number in the race of finding the most optimal number, I decided to actually look at what Gemini was telling me.

The API response has a field called `finish_reason`. I had been completely ignoring it. 

I added two lines of logging. 

```python
logger.info("Raw insight response: '%s'", response.text)
logger.info("Finish reason: %s", response.candidates[0].finish_reason)
```

Deployed. Ran the query. Checked the logs.

At 200 tokens:
```
Finish reason: FinishReason.MAX_TOKENS
```

At 500 tokens:
```
Finish reason: FinishReason.STOP
```

There it was. Two values. Two completely different situations.

`FinishReason.STOP` means Gemini finished what it was saying naturally. Response is complete.

`FinishReason.MAX_TOKENS` means Gemini hit the ceiling and got cut-off mid-sentence. Response is incomplete.

I had been running into `MAX_TOKENS` every time at 200 and had no idea because I never looked.

## What I Actually Misunderstood About Tokens

Before this I thought `max_output_tokens` work like a budget. Set it to 200, Gemini spends up to 200 tokens, done.

That's not how it works. 

`max_output_tokens` is a hard ceiling. Gemini will write as much as it needs to complete the response, and if it hits your ceiling before it's done, it will just stop. Mid-sentence, no error, no warning, just silence.

So when I set 200 and Gemini needed 250 to finish, it wrote 200 tokens worth and stopped exactly there.

The important part: **setting it higher doesn't mean Gemini uses more tokens.** If the response only needs 100 tokens, Gemini uses 100 and returns `FinishReason.STOP`. You're not wasting anything by giving it more headroom.

Setting it lower just means you're gambling that your response will always fit. Sometimes it will. Sometimes you'll get half a sentence and spend an hour debugging.

I now set `max_output_tokens` generously and let `finish_reason` tell me if something is actually wrong.

## Two Things I Do Now For Every LLM Integration

**1. Always log finish_reason**

It's one line. It tells you exactly why the response ended. Without it you're debugging blind.

```python
logger.info("Finish reason: %s", response.candidates[0].finish_reason)
```

**2. Set max_output_tokens generously**

It's a ceiling not a cost. Give the model room to finish its thought. You can always optimize later once you know what a typical response actually costs.

---

## The Real Lesson

The hardest bugs in AI systems aren't exceptions, they're not 500 errors.

They're responses that look almost right.

A truncated insight looks like a short insight. The system doesn't fail loudly, it just returns less than you expected and moves on.

That's what makes AI backend engineering different from regular backend work. You're not just handling code that breaks. You're handling a system that confidently returns incomplete answers.

The only way to catch it is to instrument everything, log what the model is actually doing, and never assume a response is complete just because it came back without an error.

I'm building this entire project in public, Fluxora - an AI analytics assistant that converts plain English to SQL and returns insights from a real database.

🔗 Live demo: [https://anubhav-fluxora.streamlit.app/](https://anubhav-fluxora.streamlit.app/)

If you're on a similar learning path, follow along. I write about what actually breaks, not just what works.

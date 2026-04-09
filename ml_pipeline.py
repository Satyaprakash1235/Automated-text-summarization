import torch
from transformers import pipeline

# Initialize a supported text-generation model.
# tiny-gpt2 is small and compatible with the installed transformers text-generation task.
generator = pipeline("text-generation", model="sshleifer/tiny-gpt2", device="cpu")

def remove_repetition(text: str) -> str:
    words = text.split()
    result = []
    for w in words:
        if not result or result[-1] != w:
            result.append(w)
    return " ".join(result)


def process_text(text: str) -> dict:
    """
    Processes extracted text to generate:
    - Short notes (summary)
    - Important points
    - Possible exam questions
    """
    # Max input length for t5 is 512 tokens. Let's truncate plain text to ~2000 chars.
    max_chars = 2500
    if len(text) > max_chars:
        text = text[:max_chars]

    text = remove_repetition(text)
        
    result = {
        "notes": "",
        "points": [],
        "questions": []
    }

    try:
        if not text.strip():
             return result

        # 1. Summarization (Short Notes)
        try:
            input_words = len(text.split())
            max_new_tokens = min(100, max(30, int(input_words * 0.5)))
            
            summary_prompt = f"Summarize the following text:\n{text}"
            summary_out = generator(
                summary_prompt,
                max_new_tokens=max_new_tokens,
                repetition_penalty=2.5,
                no_repeat_ngram_size=3,
                num_beams=4,
                do_sample=False,
                pad_token_id=generator.tokenizer.eos_token_id,
            )
            summary_text = summary_out[0].get('generated_text', "Could not generate summary.")
            result["notes"] = remove_repetition(summary_text)
        except Exception as e:
            print(f"Error in summarization: {e}")
            result["notes"] = "Failed to generate short notes."
        
        # 2. Extract keypoints
        prompt_points = f"Extract the key points from the text below:\n{text}"
        try:
            points_out = generator(
                prompt_points,
                max_new_tokens=60,
                repetition_penalty=2.5,
                no_repeat_ngram_size=3,
                num_beams=4,
                do_sample=False,
                pad_token_id=generator.tokenizer.eos_token_id,
            )
            pts_raw = points_out[0].get('generated_text', "")
            pts = [p.strip() for p in pts_raw.replace('\n', ',').split(',') if p.strip()]
            if not pts:
                 pts = [pts_raw]
            result["points"] = pts
        except Exception as e:
            print(f"Error in points extraction: {e}")
            result["points"] = ["Could not extract key points"]

        # 3. Generate exam questions
        prompt_questions = f"Generate exam-style questions from the text below:\n{text}"
        try:
            questions_out = generator(
                prompt_questions,
                max_new_tokens=120,
                repetition_penalty=2.5,
                no_repeat_ngram_size=3,
                num_beams=4,
                do_sample=False,
                pad_token_id=generator.tokenizer.eos_token_id,
            )
            q_text = questions_out[0].get('generated_text', "")
            qs = [q.strip() + "?" for q in q_text.split('?') if q.strip()]
            if not qs:
                qs = [q_text]
            result["questions"] = qs
        except Exception as e:
            print(f"Error in question generation: {e}")
            result["questions"] = ["Could not generate questions"]

    except Exception as e:
        print(f"ML Pipeline fatal error: {e}")

    return result

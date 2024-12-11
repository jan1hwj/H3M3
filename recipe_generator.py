from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import json

def parse_structured_response(response_text):
    
    try:
        start_index = response_text.find("{")
        end_index = response_text.rfind("}")
        if start_index == -1 or end_index == -1:
            raise ValueError("No JSON object found in the response.")
        
        json_text = response_text[start_index:end_index + 1]
        return json.loads(json_text)
    
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse the structured response from OpenAI. Error: {e}") from e
    
    except Exception as e:
        raise ValueError(f"Unexpected error while parsing response: {e}") from e

def generate_recipe_auto(ingredients):

    llm = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.5,
        timeout=None,
        max_retries=2,
    )
    
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are a world-class chef. Choose from the available ingredients, create a detailed recipe. You don't need to use all ingredients."
                "Format the response as JSON with the following structure:\n"
                "{{\n"
                '  "title": "<recipe title>",\n'
                '  "ingredients": ["<ingredient1>", "<ingredient2>", ...],\n'
                '  "steps": ["<step1>", "<step2>", ...]\n'
                "}}"
            ),
            ("human", "{recipe_auto}"),
        ]
    )

    chain = prompt | llm | StrOutputParser()

    out_message = chain.invoke({"recipe_auto": ", ".join(ingredients)})
    return parse_structured_response(out_message)

def generate_recipe_custom(ingredients, cuisine, servings, flavor):

    llm = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.5,
        timeout=None,
        max_retries=2,
    )

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are a world-class chef. Based on the available ingredients and user preferences, create a detailed recipe. You don't need to use all ingredients."
                "Format the response as JSON with the following structure:\n"
                "{{\n"
                '  "title": "<recipe title>",\n'
                '  "ingredients": ["<ingredient1>", "<ingredient2>", ...],\n'
                '  "steps": ["<step1>", "<step2>", ...]\n'
                "}}"
            ),
            (
                "human",
                "Ingredients: {ingredients}\n"
                "Cuisine: {cuisine}\n"
                "Serving Size: {servings}\n"
                "Flavor: {flavor}"
            ),
        ]
    )

    chain = prompt | llm | StrOutputParser()

    out_message = chain.invoke(
        {
            "ingredients": ", ".join(ingredients),
            "cuisine": cuisine,
            "servings": servings,
            "flavor": flavor,
        }
    )

    return parse_structured_response(out_message)
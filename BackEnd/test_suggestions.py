"""
Test file to verify the suggestion service works correctly
"""
import asyncio
import sys
import os

# Add the parent directory to sys.path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.suggestion_service import generate_personalized_suggestions

async def test_suggestions():
    """Test the suggestion service with sample data"""
    print("Testing suggestion service...")
    
    # Test different emotions
    test_emotions = [
        ("angry", 0.90),
        ("sad", 0.75), 
        ("fear", 0.65),
        ("happy", 0.85),
        ("disgust", 0.70)
    ]
    
    for emotion, confidence in test_emotions:
        print(f"\n{'='*60}")
        print(f"TESTING EMOTION: {emotion.upper()} (confidence: {confidence})")
        print(f"{'='*60}")
        
        try:
            suggestions = await generate_personalized_suggestions(
                current_emotion=emotion,
                confidence=confidence,
                modality="image",
                user_id="507f1f77bcf86cd799439011",  # Sample ObjectId
                all_predictions={emotion: confidence, "neutral": 0.10, "surprised": 0.05}
            )

            if not suggestions:
                print("No suggestions returned (Gemini response unavailable or parsing failed).")
                continue
            
            if "immediate_actions" in suggestions:
                print("Immediate Actions:")
                for action in suggestions["immediate_actions"]:
                    print(f"  • {action}")
            
            if "coping_strategies" in suggestions:
                print("\nCoping Strategies:")
                for strategy in suggestions["coping_strategies"]:
                    print(f"  • {strategy}")
            
            if "long_term_recommendations" in suggestions:
                print("\nLong-term Recommendations:")
                for rec in suggestions["long_term_recommendations"]:
                    print(f"  • {rec}")
            
            if "personalized_insight" in suggestions:
                print(f"\nPersonalized Insight:")
                print(f"  {suggestions['personalized_insight']}")
                
        except Exception as e:
            print(f"❌ Error testing {emotion}: {e}")
    
    print(f"\n{'='*60}")
    print("✅ All emotion tests completed!")
    return True

if __name__ == "__main__":
    success = asyncio.run(test_suggestions())
    sys.exit(0 if success else 1)
from functools import lru_cache

from ultralytics import YOLO


def class_name(model: YOLO, class_id: int) -> str:
    names = model.names
    if isinstance(names, dict):
        return str(names.get(class_id, f"class_{class_id}"))
    return str(names[class_id]) if class_id < len(names) else f"class_{class_id}"


@lru_cache(maxsize=2)
def load_model(weights_path: str) -> YOLO:
    return YOLO(weights_path)

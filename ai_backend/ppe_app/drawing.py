import cv2


def draw_label_with_bg(frame, text, anchor, text_color, bg_color, font_scale=0.65, thickness=2):
    x, y = anchor
    font = cv2.FONT_HERSHEY_SIMPLEX
    text_size, _ = cv2.getTextSize(text, font, font_scale, thickness)
    tw, th = text_size
    pad = 4
    x1 = max(0, x - pad)
    y1 = max(0, y - th - (pad * 2))
    x2 = min(frame.shape[1] - 1, x + tw + pad)
    y2 = min(frame.shape[0] - 1, y + pad)
    cv2.rectangle(frame, (x1, y1), (x2, y2), bg_color, -1)
    cv2.putText(frame, text, (x, y - pad), font, font_scale, text_color, thickness, cv2.LINE_AA)

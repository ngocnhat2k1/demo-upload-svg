# FREIGHT DECAL — Texture image fill cho text

**Ngày:** 2026-06-30
**Phạm vi:** Thêm khả năng fill ảnh nền (texture) vào các field text của template FREIGHT DECAL. Cơ chế làm generic qua convention zone, nhưng hiện chỉ bật cho FREIGHT DECAL.

---

## 1. Mục tiêu

Cho phép chữ trong decal được "lấp" bằng một ảnh texture (vd diamond-plate kim loại) thay vì màu trơn.

Hai trạng thái cho mỗi field text:

- **Mặc định (`mode = image`):** cả ruột chữ lẫn viền đều là texture.
- **Chọn màu (`mode = color`):** ruột chữ = màu đặc do user chọn, **viền vẫn giữ texture**.

Đây đúng theo 2 ảnh tham chiếu user gửi (trái = texture toàn bộ, phải = ruột màu + viền texture).

Texture là **1 ảnh chung cho cả decal**, đặt ở toạ độ full-canvas nên vân ảnh **liền mạch và thẳng hàng** qua mọi dòng chữ.

## 2. Quyết định đã chốt

| Câu hỏi | Quyết định |
|---|---|
| Cách fill khi chọn màu | Mặc định ảnh; chọn màu → ruột màu, viền giữ ảnh |
| Field áp dụng | Cả 6 field text của FREIGHT đều hỗ trợ; mỗi field tự bật/tắt (IMAGE \| COLOR) |
| Nguồn ảnh | Preset bundle sẵn (kéo từ Google Drive). Tạm dùng texture placeholder tự sinh tới khi kéo được ảnh thật; swap chỉ là thay data, không đụng logic |
| Phạm vi | Generic convention nhưng chỉ bật cho FREIGHT DECAL |

**Ngoài phạm vi (YAGNI):** mỗi field một ảnh khác nhau; user upload ảnh tuỳ ý; bật cho template khác; điều chỉnh scale/offset của texture.

## 3. Kỹ thuật SVG

Với mỗi `<text>` được đánh dấu texture, `applyCustomization` sinh ra:

```svg
<defs>
  <mask id="tex-mask-{id}" maskUnits="userSpaceOnUse">
    <!-- vùng trắng = nơi ảnh hiện ra; gồm cả thân + stroke = toàn bộ glyph kể cả viền -->
    <text ... fill="#fff" stroke="#fff" stroke-width="{W}"
          paint-order="stroke" stroke-linejoin="round">NỘI DUNG</text>
  </mask>
</defs>

<!-- lớp ảnh, mask theo hình chữ. Full-canvas để vân liền mạch -->
<image href="{dataURI}" x="0" y="0" width="600" height="400"
       preserveAspectRatio="xMidYMid slice" mask="url(#tex-mask-{id})"/>

<!-- CHỈ khi mode=color: phủ ruột chữ bằng màu đặc (không stroke) -->
<text ... fill="{COLOR}">NỘI DUNG</text>

<!-- contour mảnh giữ cạnh nét, đè trên cùng -->
<text ... fill="none" stroke="#0a0a0a" stroke-width="1.2"
      paint-order="stroke" stroke-linejoin="round">NỘI DUNG</text>
```

Giải thích:

- **Mask** dùng `fill=#fff` + `stroke=#fff width=W` ⟹ vùng sáng phủ kín cả thân chữ lẫn viền dày W. `<image>` chỉ hiện trong vùng đó.
- **Default (image):** không có lớp phủ màu ⟹ toàn bộ glyph (ruột + viền) = texture.
- **Color:** lớp `<text fill=color>` (không stroke) phủ đúng phần thân, đè lên texture ở ruột; phần viền dày W nằm ngoài thân vẫn là texture ⟹ "viền giữ ảnh".
- **Contour** mảnh màu tối đè trên cùng cho cạnh sắc nét ở cả 2 mode.
- Mỗi field một `<mask>` id riêng (`tex-mask-{id}`) nhưng **dùng chung 1 `<image>` href**; vì đều ở toạ độ (0,0,600,400) nên texture căn giống nhau ⟹ liền mạch.
- `W` (độ dày viền) kế thừa từ `stroke-width` gốc của field.

## 4. Data model (state `customization`)

Thêm các khoá mới, **không phá khoá cũ**:

- `__texture` — id của preset texture đang chọn cho cả decal (vd `'tex-diamond'`). Global, 1 ảnh/decal. `null`/rỗng = không có texture (tất cả field về behavior cũ).
- `text-{x}__mode` — `'image' | 'color'`, mặc định `'image'` cho field có texture.
- Giữ nguyên: `text-{x}` (nội dung), `text-{x}__color` (màu).

Khi `__texture` rỗng thì field hiển thị y như hiện tại (stroke gold + fill color) — backward compatible.

## 5. Convention generic

- Field opt-in texture bằng attribute `data-texture="true"` trên `<text>`.
- `parseSvgZones`: với mỗi text-zone, đọc thêm `supportsTexture = el.getAttribute('data-texture') === 'true'`.
- Template "có texture" = có ≥1 field `supportsTexture`. Chỉ template đó mới hiện panel chọn texture + toggle IMAGE/COLOR.
- **FREIGHT DECAL:** thêm `data-texture="true"` vào cả 6 `<text>`. Các template khác không sửa ⟹ không ảnh hưởng.

## 6. Texture presets

- Một mảng `TEXTURE_PRESETS = [{ id, name, dataURI }]`.
- `dataURI` = ảnh nhúng base64 (`data:image/...`) ⟹ SVG xuất ra **self-contained**, preview == file in, không phụ thuộc URL ngoài.
- Giai đoạn đầu: 2–3 texture diamond-plate/metal placeholder (PNG nhỏ hoặc SVG-pattern rasterized). Sau swap bằng ảnh Drive thật — chỉ đổi `dataURI`.

## 7. UI (Customizer)

1. **Panel "BACKGROUND TEXTURE"** (chỉ hiện khi template có texture): hàng swatch ảnh preset + nút "NONE". Click → set `__texture`. Có viền active giống color picker hiện tại.
2. **Mỗi `TextZoneControl` của field texture** thêm toggle nhỏ **`IMAGE | COLOR`**:
   - `IMAGE`: ẩn khối color picker (ruột = texture).
   - `COLOR`: hiện color picker như cũ; áp màu vào ruột, viền vẫn texture.
   - Khi `__texture` rỗng: ẩn toggle, field về UI cũ.
3. Zone preview strip & swatch ở card: field texture hiển thị icon ảnh thay cho chấm màu khi đang mode image.

## 8. Render & Export

- `applyCustomization` đọc `__texture` + per-field `__mode` để sinh markup ở mục 3.
- Vì texture là data-URI nhúng, `finalSvg` trong cart và file xuất ra đều self-contained.
- `selectTemplate` init: với field `supportsTexture`, set `__mode='image'`; set `__texture` = preset đầu tiên (để FREIGHT mặc định có texture như ảnh tham chiếu).

## 9. Các đơn vị thay đổi

- `SAMPLE_TEMPLATES['tpl-freight-decal']` — thêm `data-texture="true"` ×6.
- `TEXTURE_PRESETS` — hằng số mới.
- `parseSvgZones` — đọc `supportsTexture`.
- `applyCustomization` — sinh mask/image/overlay/contour cho field texture.
- `selectTemplate` / `Customizer.reset` — init `__texture`, `__mode`.
- `Customizer` — panel texture + truyền props.
- `TextZoneControl` — toggle IMAGE/COLOR.

## 10. Rủi ro / lưu ý

- **ID trùng:** mask id phải unique theo field id; mỗi lần render tạo `<defs>` mới — đảm bảo không nhân đôi `<defs>` khi field nhiều (gộp vào 1 `<defs>` hoặc nhiều `<defs>` đều hợp lệ).
- **Thứ tự DOM:** image/overlay/contour của một field phải chèn đúng vị trí (thay thế node `<text>` gốc tại chỗ) để không che các phần tử khác.
- **`dominant-baseline`/`text-anchor`:** mọi lớp text (mask, overlay, contour) phải copy y hệt attribute định vị của text gốc, nếu lệch sẽ ra bóng đôi.
- **Kích thước base64:** texture nên nén nhỏ (≤~50KB/ảnh) để state & export không phình.

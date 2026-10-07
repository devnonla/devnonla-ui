---
path: "/components/markdown-viewer"
title: "MarkdownViewer"
group: "Data Entry"
groupOrder: 5
order: 4
icon: "document-text-24"
---

# MarkdownViewer

Xem markdown đã viết. Chỉ đọc: heading, list, bảng, code, mermaid, và khối live-react.

`variant` chọn preset cỡ chữ. `docs` (mặc định) để rộng. `chat` siết size và khoảng cách cho hội thoại. `ChatMarkdown` truyền `chat`.

## Hai preset

Cùng một đoạn. `docs` ở trái, `chat` ở phải.

```live-react
import { MarkdownViewer } from "devnonla-ui";

const snippet = `# Bảy ngày ở Đà Lạt

Mình lên Đà Lạt không phải để đi cho đủ chỗ. Phần **đậm** là thứ mình không muốn quên. Phần *nghiêng* là cảm giác lúc đó. Giờ ở lề sổ là \`06:41\`.

## Sáng ở hồ Xuân Hương

Hồ nằm giữa thành phố như một khoảng thở. Sáu giờ rưỡi, mặt nước còn xám.

### Sương và người chạy bộ

Sương không đều. Có quãng dày đến mức hàng thông phía xa chỉ còn một vệt.

- Hồ Xuân Hương, gần như mỗi sáng
- Chợ đêm, đi hai lần
- Ga Đà Lạt

> Hôm qua mưa phùn cả buổi. Mình ngồi ở quán gần chợ và viết đến khi hết trang.

| Ngày | Trang sổ |
| --- | --- |
| Thứ hai | 4 |
| Thứ tư | 7 |
`;

export default function Demo() {
  return (
    <div className="grid items-start gap-8 text-left md:grid-cols-2">
      <div className="min-w-0">
        <div className="mb-3 text-[13px] font-medium text-muted-foreground">docs</div>
        <MarkdownViewer value={snippet} variant="docs" />
      </div>
      <div className="min-w-0">
        <div className="mb-3 text-[13px] font-medium text-muted-foreground">chat</div>
        <MarkdownViewer value={snippet} variant="chat" />
      </div>
    </div>
  );
}
```

## Bài đầy đủ

Dài như một blog, đủ các loại block. Preset `docs`.

```live-react
import { MarkdownViewer, Tag } from "devnonla-ui";

const sample = [
  "# Bảy ngày ở Đà Lạt",
  "",
  "Mình lên Đà Lạt không phải để đi cho đủ chỗ. Cuốn sổ trong ba lô chỉ có vài trang trắng, một cây bút sắp hết mực, và thói quen ghi lại thứ còn sót sau khi ~~lịch trình~~ ngày đã trôi qua. Bài này là bản chép lại: chỗ nào nắng, chỗ nào mưa phùn, và những dòng đáng giữ.",
  "",
  "Có đoạn viết vội trên điện thoại, có đoạn viết ở quán khi cà phê đã nguội. Phần **đậm** là thứ mình không muốn quên. Phần *nghiêng* là cảm giác lúc đó, chưa kiểm lại. Phần ***vừa đậm vừa nghiêng*** là câu mình đọc đi đọc lại trên tàu. Những tên ngắn trong sổ thì để dạng `inline`, cho dễ tìm khi cuộn. Nếu muốn xem thành phố trước khi đọc tiếp, mở [Đà Lạt](https://vi.wikipedia.org/wiki/%C4%90%C3%A0_L%E1%BA%A1t) trên Wikipedia: sương, thông, và một hồ nằm giữa phố.",
  "",
  "Một tuần nghe thì ngắn. Đi bộ thì dài. Mình không cố viết hay. Mình cố viết đúng cái đã xảy ra, kể cả những buổi chẳng có gì để khoe.",
  "",
  "## Sáng ở hồ Xuân Hương",
  "",
  "Hồ nằm giữa thành phố như một khoảng thở. Sáu giờ rưỡi, mặt nước còn xám. Người chạy bộ đi ngược chiều kim đồng hồ, đều, ít nói. Mình ngồi băng ghế gần cầu, để sổ trên đùi, và đợi sương mỏng ra. Không có nhạc. Tiếng giày trên đường đủ để biết thành phố đã dậy.",
  "",
  "Có một lúc không viết được gì. Gió đẩy trang. Mực nhòe ở chữ *sương*. Mình để vậy, không viết đè. Sau này đọc lại, vết nhòe còn đúng hơn câu đã sửa. Những buổi sau mình học cách úp tay lên trang khi có gió, và chỉ viết khi đã ngồi yên được vài phút.",
  "",
  "Người địa phương đi qua không nhìn lâu. Khách thì dừng chụp ở lan can, rồi đi tiếp. Mình thuộc nhóm thứ ba: ngồi đến khi lạnh hết phần đùi áp vào ghế, rồi mới đứng dậy tìm quán.",
  "",
  "### Sương và người chạy bộ",
  "",
  "Sương không đều. Có quãng dày đến mức hàng thông phía xa chỉ còn một vệt. Có quãng tan trong vài phút, rồi nắng chạm mặt nước thành một dải hẹp. Người chạy bộ không dừng. Mình thì dừng khá nhiều: buộc lại dây giày dù không chạy, nhìn một con chim đáp xuống thành hồ, rồi quên mất mình đang định viết câu gì.",
  "",
  "Khoảng bảy giờ, sương nhạt hơn nhưng chưa hết. Màu nước chuyển từ xám sang một thứ xanh rất nhạt, gần như chỉ thấy khi nhìn lâu. Mình ghi lại giờ, không ghi lại màu. Màu thì về khách sạn sẽ nhớ sai.",
  "",
  "#### Quán bên hồ",
  "",
  "Quán mở cửa từ sáu giờ. Bàn nhựa, menu viết tay, và một anh pha chế ít hỏi. Mình gọi cà phê sữa nóng. Ly đến khi mình đã ngồi được một lúc, đúng lúc trang đầu vừa khô. Quán không có tên to. Biển thì mờ, đọc từ ghế bên hồ thì không ra chữ. Mình nhớ quán bằng cánh cửa lưới và bằng cái thìa để sẵn trong ly, không đợi khách xin.",
  "",
  "##### Order buổi sáng",
  "",
  "Cà phê sữa, không đường. Một ổ bánh mì nhỏ để dành, ăn sau khi viết xong đoạn đầu. Nước lọc thì quán đưa không cần gọi. Hôm gió mạnh, ly hết nóng trước khi mình viết xong bốn dòng. Hôm lặng, mình ngồi được đến lúc quán bắt đầu có người thứ hai.",
  "",
  "###### Ghi ở lề sổ",
  "",
  "Ở lề mình chỉ viết giờ: `06:41`. Không viết cảm xúc ở lề. Cảm xúc để vào giữa trang, nơi còn chỗ cho một câu dài. Nếu một buổi không có câu nào đáng giữa trang, lề vẫn có giờ. Như vậy lật sổ vẫn biết mình đã có mặt.",
  "",
  "![Ánh sáng trên mặt hồ, buổi sáng sớm](https://picsum.photos/id/1015/1400/720)",
  "",
  "*Ảnh chỉ để nhớ thứ ánh sáng hôm đó: mặt nước, một dải cây, và trời còn thấp. Không phải ảnh mình chụp. Máy mình hôm ấy để trong ba lô, hết pin từ hôm trước.*",
  "",
  "Địa chỉ mình gửi bưu thiếp, chép nguyên từ sau bìa sổ:",
  "12 Trần Phú",
  "Phường 3, Đà Lạt",
  "Gửi vào thứ năm, trước khi hết tem",
  "",
  "## Những chỗ trong tuần",
  "",
  "Mình không đi theo một danh sách có sẵn. Mỗi tối gạch chỗ của ngày hôm sau, rồi sáng hôm sau vẫn đổi. Danh sách dưới đây là những chỗ thực sự đã đến. Những chỗ chỉ nằm trong kế hoạch cũ thì mình không chép lại nữa.",
  "",
  "- Hồ Xuân Hương, gần như mỗi sáng",
  "  - Băng ghế phía cầu, chỗ khuất gió hơn",
  "  - Quán mở cửa lúc sáu giờ, cửa lưới",
  "- Chợ đêm, đi hai lần",
  "  - **Bánh tráng nướng**, thêm trứng, không thêm nhiều sốt",
  "  - Sữa đậu nành nóng, uống đứng vì bàn đầy",
  "  - Một quầy bán len mà mình chỉ đứng xem, không mua",
  "- Ga Đà Lạt",
  "  - Tàu cổ đậu sân, màu cũ hơn trong ảnh",
  "  - Quầy vé buổi sáng, ít người, nhân viên nói nhỏ",
  "- Langbiang, một buổi gió mạnh, xuống sớm hơn dự định",
  "- Thiền viện, ở lại đến khi hết một trang",
  "",
  "Thứ tự các ngày, viết lại cho khỏi lẫn khi sổ giấy không đánh số:",
  "",
  "1. Thứ hai — hồ, chợ, và một cơn mưa ngắn lúc bốn giờ. Giày ướt đến tối.",
  "2. Thứ ba — Langbiang. Gió mạnh hơn dự kiến. Trong sổ chỉ có hai trang, chữ to vì đeo găng.",
  "3. Thứ tư — ở quán gần chợ cả buổi chiều. Viết nhiều nhất tuần. Mưa phùn ngoài cửa, không vào được đến hồ.",
  "4. Thứ năm — ga, rồi đi bộ về theo đường dài hơn. Gửi bưu thiếp trên đường.",
  "5. Thứ sáu — thiền viện. Ít chữ. Nhiều khoảng trống. Bút máy bắt đầu cạn.",
  "6. Thứ bảy — quay lại hồ vào buổi chiều. Ánh sáng khác hẳn buổi sáng. Nước không còn xám.",
  "7. Chủ nhật — dọn sổ, gạch những dòng không cần giữ, rồi ra bến sớm hơn giờ ghi trên vé.",
  "",
  "Đọc lại danh sách này mình thấy một điều hơi buồn cười: những ngày ghi là đi nhiều thì sổ mỏng, những ngày gần như ngồi một chỗ thì sổ dày. Mình cứ tưởng ngược lại.",
  "",
  "## Đồ ăn mình còn nhớ",
  "",
  "Mình không đi Đà Lạt vì ăn. Nhưng vài thứ vẫn bám lại rõ hơn tên đường. Bánh tráng nướng ở chợ đêm thì nóng, mép hơi cháy, trứng còn ướt ở giữa. Lần đầu mình ăn đứng. Lần sau mình tìm được một bậc thềm, ngồi xuống, và ăn chậm hơn, đủ để thấy bánh không cần thêm gì nữa.",
  "",
  "Sáng thì gần như chỉ cà phê sữa. Quán bên hồ pha đậm hơn quán gần chợ. Mình không hỏi loại hạt. Hỏi rồi cũng quên, mà vị thì gắn với chỗ ngồi hơn là với tên. Ở quán chợ, ly đến kèm một ly nước lạnh. Mình ít khi uống hết nước. Ở quán hồ, không có nước lạnh, và mình cũng không thấy thiếu.",
  "",
  "Chiều thứ năm, sau khi rời ga, mình ghé một chỗ bán bánh mì thịt nguội. Không ngon bằng mình tưởng khi nhìn từ ngoài. Mình vẫn ăn hết, vì đang đi bộ và vì không muốn viết một dòng chỉ để chê. Trong sổ hôm đó không có tên quán. Chỉ có một câu: bánh mì ổn, đường về dài hơn lúc đi.",
  "",
  "Những thứ mình định ăn mà không ăn cũng đáng một danh sách ngắn, kẻo lần sau lại tưởng mình đã thử:",
  "",
  "- Lẩu một người, thấy bảng ở hai quán, trời không đủ lạnh",
  "- Bánh căn buổi sáng, quán đông, mình đang muốn yên để viết",
  "- Một xe kem trên đường về khách sạn, đóng từ trước khi mình đến nơi",
  "",
  "## Việc trong sổ",
  "",
  "Cuối mỗi ngày mình gạch việc, không gạch cảm xúc. Việc thì xong hoặc chưa. Cảm xúc để ở các trang phía trước, nơi không có ô vuông.",
  "",
  "- [x] Mua tem và gửi bưu thiếp trước thứ năm",
  "- [x] Chép lại các trang bị mưa làm nhòe, kể cả chỗ không đọc hết",
  "- [x] Ghi tên quán bên hồ bằng cách vẽ cửa, kẻo hôm sau không nhớ mặt tiền",
  "- [x] Sạc máy, dù gần như không mở",
  "- [ ] Vẽ lại lối từ ga về khách sạn, lúc về mới thấy mình nhớ sai một ngã",
  "- [ ] Hỏi anh pha chế tên loại cà phê buổi sáng",
  "- [ ] In một bản để kẹp vào sổ giấy, phòng khi mực chì mờ",
  "",
  "Ba dòng chưa gạch không làm tuần dở. Chúng nhắc mình là sổ này chưa đóng hẳn, dù người thì đã về.",
  "",
  "## Tiền, giờ, và trang đã viết",
  "",
  "Mình ghi chi tiêu không phải để tiết kiệm cho đẹp số. Ghi để biết ngày nào mình thực sự ở ngoài đường, ngày nào ngồi một chỗ. Tiền trong bảng là tiền ăn và vé, không tính phòng. Phòng trả từ trước, ghi vào đây chỉ làm các ngày trông giống nhau.",
  "",
  "| Ngày | Chỗ chính | Giờ ngoài đường | Trang sổ | Ghi chú |",
  "| --- | --- | --- | --- | --- |",
  "| Thứ hai | Hồ Xuân Hương | 6 giờ | 4 | Sương dày đến gần chín giờ, mưa ngắn lúc bốn giờ |",
  "| Thứ ba | Langbiang | 5 giờ | 2 | Gió mạnh, chữ to, về sớm |",
  "| Thứ tư | Quán gần chợ | 3 giờ | 7 | Viết nhiều nhất tuần, mưa phùn cả buổi |",
  "| Thứ năm | Ga Đà Lạt | 4 giờ | 3 | Tàu cổ, gửi bưu thiếp, về đường dài |",
  "| Thứ sáu | Thiền viện | 5 giờ | 1 | Một trang, nhiều khoảng trống, bút bắt đầu cạn |",
  "| Thứ bảy | Hồ, buổi chiều | 3 giờ | 3 | Ánh sáng khác buổi sáng, nước đỡ xám |",
  "| Chủ nhật | Khách sạn, rồi ga | 2 giờ | 2 | Chép lại, gạch bớt, ra bến sớm |",
  "",
  "Nhìn cột trang sổ là thấy cả tuần. Thứ tư ngồi ít mà viết nhiều. Thứ sáu ở ngoài lâu mà gần như không viết. Mình từng nghĩ một chuyến tốt là chuyến về với nhiều chữ. Tuần này thì không hẳn. Trang mỏng thứ sáu vẫn là trang mình hay mở lại nhất, vì khoảng trống đúng với buổi đó.",
  "",
  "## Một đoạn để nguyên",
  "",
  "> Hôm qua mưa phùn cả buổi. Mình ngồi ở quán gần chợ, gọi một ly cà phê sữa, và viết đến khi hết trang. Có người vào hỏi đường ra hồ. Mình chỉ tay, rồi quên mất đang viết dở câu nào. Câu đó về sau không tìm lại được. Mình để một khoảng trắng, không bịa nối.",
  ">",
  "> Không phải mọi dòng đều đáng giữ. Phần đáng giữ là cái còn nhớ sau khi gấp sổ lại: mùi áo ẩm, tiếng thìa chạm ly, và chữ *sương* bị nhòe từ sáng thứ hai. Những câu nghe như viết cho người khác đọc thì mình gạch khi ở trên tàu.",
  ">",
  "> Mình chép đoạn này nguyên văn, kể cả chỗ lặp, vì lúc viết mình không có ý định đăng. Đăng là việc của tối chủ nhật, khi đã về đến phòng và thấy vài trang đáng để người khác đọc cùng.",
  "",
  "---",
  "",
  "Trước khi về mình định ~~ở lại thêm ba ngày~~ rồi thôi. Vé đã mua. Sổ còn vài trang trắng. Để trắng cũng là một cách kết thúc, đỡ hơn là viết thêm cho đủ dày.",
  "",
  "## Sổ tay thì chép thế này",
  "",
  "Những ghi chú ngắn trên điện thoại mình để dạng một object nhỏ, cho khỏi lẫn với đoạn văn. Không có ứng dụng gì đặc biệt. Chỉ là cho mình đọc lại được khi sổ giấy đang phơi cho khô. Các ngày không có trong danh sách là các ngày mình không mở máy.",
  "",
  "```ts",
  "type Note = {",
  "  day: number;",
  "  place: string;",
  "  body: string;",
  "};",
  "",
  "const week: Note[] = [",
  '  { day: 1, place: "Hồ Xuân Hương", body: "Sương đến chín giờ. Chữ đầu trang bị nhòe." },',
  '  { day: 2, place: "Langbiang", body: "Gió mạnh hơn dự kiến. Xuống sớm." },',
  '  { day: 3, place: "Quán gần chợ", body: "Viết đến hết trang. Mưa phùn ngoài cửa." },',
  '  { day: 6, place: "Hồ, buổi chiều", body: "Ánh sáng khác hẳn sáng. Nước đỡ xám." },',
  "];",
  "",
  "function kept(notes: Note[]): Note[] {",
  "  return notes.filter((note) => note.body.length > 0);",
  "}",
  "```",
  "",
  "Tối chủ nhật mình copy thư mục ghi chú ra một chỗ, rồi mới dọn ba lô. Làm ngược thì dễ quên file nào đang nằm trong máy, file nào chỉ có trên giấy.",
  "",
  "```bash",
  "cd ~/notes",
  "mkdir -p 2026-10-dalat",
  "cp week.md 2026-10-dalat/week.md",
  "ls -l 2026-10-dalat",
  "```",
  "",
  "Một file nhỏ để nhớ chuyến nào đã đóng, kẻo tháng sau mở nhầm thư mục và viết tiếp vào tuần cũ:",
  "",
  "```json",
  "{",
  '  "trip": "dalat",',
  '  "days": 7,',
  '  "pages": 22,',
  '  "closed": true',
  "}",
  "```",
  "",
  "## Một ngày đi qua những đâu",
  "",
  "Không phải ngày nào cũng đủ các chặng. Sơ đồ dưới đây là ngày đầy đủ nhất: buổi sáng ở hồ, rồi một chỗ vào buổi chiều, rồi tối chép lại. Mình ghép thứ tư với mấy buổi sáng cho dễ nhìn, không phải để tuần trông bận hơn thực tế.",
  "",
  "```mermaid",
  "flowchart TD",
  "  A[Thức, khoảng sáu giờ] --> B[Hồ Xuân Hương]",
  "  B --> C{Sương còn dày}",
  "  C -->|Còn| D[Ngồi chờ, ghi giờ ở lề]",
  "  C -->|Tan| E[Đi một vòng hồ]",
  "  D --> E",
  "  E --> F[Quán bên hồ]",
  "  F --> G[Chợ, ga, hoặc về quán viết]",
  "  G --> H[Tối, chép lại trang nhòe]",
  "  H --> I[Gạch chỗ cho ngày mai]",
  "```",
  "",
  "## Mưa thứ tư",
  "",
  "Thứ tư đáng một mục riêng vì đó là ngày sổ dày nhất, và cũng là ngày mình đi ít nhất. Mưa không to. Mưa phùn, kiểu ướt vai sau vài phút dù tưởng chỉ đứng ở cửa. Mình vào quán gần chợ lúc gần mười một giờ, định ngồi một lúc rồi ra hồ. Một lúc thành cả buổi.",
  "",
  "Bàn ở góc, gần ổ điện, dù máy không cần sạc. Mình chọn góc vì ít người đi ngang qua trang giấy. Cà phê thứ hai nguội gần hết thì mình mới nhận ra là mình đang chép lại sáng thứ hai, không phải đang viết ngày mới. Chép lại hóa ra cần hơn viết mới. Trang bị nhòe có những chữ mình chỉ còn đoán được khi ngồi yên.",
  "",
  "Có một đoạn mình viết rồi gạch, viết lại, rồi gạch tiếp. Tối về đọc, mình giữ bản gạch. Bản sạch nghe như một người khác đã đến Đà Lạt hộ mình. Bản gạch còn dấu đã dừng đúng chỗ, không cố nói thêm.",
  "",
  "Ngoài cửa, người ta vẫn đi chợ. Ni lông kêu, tiếng cân, tiếng ai đó gọi nhau qua đường. Mình không chép các tiếng đó thành danh sách. Chúng nằm trong câu về tiếng thìa, vì cùng một buổi, và vì sổ không cần mọi thứ đều có gạch đầu dòng.",
  "",
  "## Buổi chiều thứ bảy",
  "",
  "Thứ bảy mình quay lại hồ, cố tình không đi sáng. Muốn xem cùng một chỗ khi trời đã khác. Nước trong hơn. Hàng thông hết núp trong sương. Người chạy bộ vẫn có, nhưng thưa, và có thêm người ngồi câu ở phía bên kia, rất xa, gần như không cử động.",
  "",
  "Mình ngồi đúng băng ghế cũ. Không còn lạnh đùi. Trang mới không bị gió giật. Mình viết ngắn. Viết dài dễ thành so sánh với buổi sáng, mà so sánh thì nghe như một bài nhận xét, không còn là sổ tay. Câu giữ lại chỉ nói nước đỡ xám, và ghế đã khô.",
  "",
  "Trước khi đứng dậy mình đọc lại từ trang đầu tuần. Vài chữ không còn đúng với người đang ngồi đây. Mình không sửa. Người sáng thứ hai được phép viết khác người chiều thứ bảy. Sổ không phải một giọng.",
  "",
  "## Trạng thái bài",
  "",
  "Khối dưới đây không phải ảnh và cũng không phải đoạn văn. Nó chạy như một mảnh giao diện nằm trong bài, để thấy chỗ `live-react` ngồi cùng heading, bảng, và sơ đồ.",
  "",
  "```live-react",
  'import { Tag } from "devnonla-ui";',
  "",
  "export default function TripStatus() {",
  "  return (",
  "    <span>",
  '      Sổ tay Đà Lạt <Tag color="green">đã chép xong</Tag>',
  "    </span>",
  "  );",
  "}",
  "```",
  "",
  "## Trước khi tàu chạy",
  "",
  "Sáng chủ nhật ga vắng hơn mình tưởng. Mình đứng ngoài sân một lúc, không vào ngay. Tàu cổ vẫn đậu đúng chỗ hôm thứ năm. Mình không chụp thêm. Ảnh trong máy đủ, và có những thứ chụp lại thì hết giống cái mình vừa đứng nhìn.",
  "",
  "Trên tàu mình đọc lại từ đầu. Vài câu thừa. Vài câu đúng đến mức không cần sửa. Mình gạch những dòng nghe như viết cho người khác, giữ những dòng chỉ mình hiểu: `06:41`, chữ *sương* nhòe, và câu hỏi đường ra hồ giữa lúc đang viết dở. Hết bút máy từ thứ sáu nên các trang cuối là nét chì, nhạt, nhưng vẫn đọc được khi đưa ra cửa sổ.",
  "",
  "Nếu có lần sau, mình sẽ mang thêm một cây bút. Và sẽ bớt mang kế hoạch. Tuần này đẹp nhất ở những chỗ không có trong tờ giấy tối hôm trước: mưa thứ tư, ghế khô chiều thứ bảy, và trang gần như trắng ở thiền viện.",
  "",
  "Đà Lạt không cần mình kể đủ. Một tuần là đủ để biết mình thích ngồi hơn thích đi, và một cuốn sổ mỏng thì vừa, miễn là còn chỗ cho một câu chưa viết xong. Câu đó hiện vẫn ở trang cuối, bằng chì, không có dấu chấm.",
  "",
  "---",
  "",
  "Hết. Các trang trắng còn lại để dành cho chuyến sau. Ba việc chưa gạch ở trên cũng để đó, không cần đóng cho đủ ô.",
].join("\n");

export default function Demo() {
  return (
    <MarkdownViewer
      value={sample}
      trustedModules={{ "devnonla-ui": { Tag } }}
      className="w-full text-left"
    />
  );
}
```

export const lifecycleSteps = [
  {
    id: 1,
    label: 'Phân tích cơ hội',
    hint: 'Nhận yêu cầu báo giá; phân tích cơ hội, khả thi và làm rõ phạm vi với khách.',
    x: 9,
    threadY: 50,
    side: 'below',
    knotGap: 20,
  },
  {
    id: 2,
    label: 'Chào thầu, thiết kế',
    hint: 'Chuẩn bị hồ sơ chào thầu: giải pháp, quotation và phạm vi sơ bộ.',
    vi: true,
    x: 25,
    threadY: 42,
    side: 'above',
    knotGap: 20,
  },
  {
    id: 3,
    label: 'Thiết kế kỹ thuật',
    hint: 'Thiết kế chi tiết hệ thống điện; build phần mềm / hệ thống trên One ATS.',
    vi: true,
    x: 41,
    threadY: 54,
    side: 'below',
    knotGap: 20,
  },
  {
    id: 4,
    label: 'Chuẩn bị và triển khai hiện trường',
    hint: 'Mua sắm, FAT, thi công lắp đặt và triển khai tại hiện trường.',
    x: 57,
    threadY: 42,
    side: 'above',
    knotGap: 20,
  },
  {
    id: 5,
    label: 'Đào tạo và bàn giao',
    hint: 'SAT, đào tạo vận hành và chuyển giao hệ thống cho khách hàng.',
    x: 73,
    threadY: 54,
    side: 'below',
    knotGap: 20,
  },
  {
    id: 6,
    label: 'Bảo hành, bảo trì, hỗ trợ sau dự án',
    hint: 'Duy trì hệ thống, bảo hành và hỗ trợ khách hàng sau bàn giao.',
    x: 89,
    threadY: 42,
    side: 'above',
    knotGap: 20,
  },
]

export const pressureNarrative = {
  lede: 'Một dự án có thể dựa vào kinh nghiệm cá nhân. Nhưng khi nhiều dự án chạy song song, tốc độ, nguồn lực và chất lượng bắt đầu mất kiểm soát.',
  problemsHeading: 'Bốn vấn đề',
  meterLabel: 'Dự án song song',
  meterFrom: 3,
  meterTo: 18,
  overloadLabel: 'QUÁ TẢI',
  capacityLabel: 'Mức tải nguồn lực',
}

export const painPoints = [
  {
    id: 'speed',
    title: 'Tốc độ',
    detail: 'Thời gian bị tiêu tốn vào việc tìm kiếm, tổng hợp và kiểm tra lại thông tin.',
  },
  {
    id: 'resources',
    title: 'Nguồn lực',
    detail: 'Một số ít nhân sự giàu kinh nghiệm phải liên tục gánh phần việc quan trọng nhất.',
  },
  {
    id: 'management',
    title: 'Quản lý',
    detail: 'Khó theo dõi tiến độ, đầu việc, phiên bản tài liệu và trạng thái của từng dự án.',
  },
  {
    id: 'traceability',
    title: 'Truy xuất',
    detail: 'Khi cần xem lại dự án cũ, thông tin nằm rải rác và phụ thuộc vào trí nhớ cá nhân.',
  },
]

export const scenes = [
  {
    id: 'lifecycle',
    label: 'Vòng đời',
    eyebrow: 'ATS · Project lifecycle',
    title: 'Vòng đời dự án ATS',
  },
  {
    id: 'pressure',
    label: 'Áp lực',
    eyebrow: 'Khi scale nhiều dự án',
    title: 'Khó khăn khi scale',
  },
  {
    id: 'vi',
    label: 'VI',
    eyebrow: 'Volt Intelligent',
    title: 'ATS VI đang hỗ trợ',
  },
]

export const viDefinition = {
  title: 'ATS VI · Volt Intelligent',
  lede: 'Nền tảng AI nội bộ của ATS — hỗ trợ hình thành giải pháp, quản lý tri thức, xử lý tài liệu và tự động hóa phần lặp lại trong vòng đời dự án.',
}

export const viLayers = [
  {
    id: 'knowledge',
    label: 'Lớp tri thức',
    keywords: ['Tài liệu', 'RAG', 'DMS', 'Phân quyền'],
  },
  {
    id: 'assistant',
    label: 'Lớp trợ lý AI',
    keywords: ['Chat', 'Hỏi đáp nội bộ', 'Tìm kiếm', 'Tổng hợp'],
  },
  {
    id: 'workflow',
    label: 'Lớp workflow',
    keywords: ['SFA', 'Co-Builder', 'Template', 'Artifact kỹ thuật'],
  },
]

/** Năng lực hiện tại tại bước 2 (SFA) & 3 (Co-Builder) */
export const viCapabilities = {
  2: {
    module: 'SFA',
    tagline: 'Solution Forming Assistant',
    stepLabel: 'Bước 2 · Chào thầu, thiết kế',
    items: [
      'Gom tri thức từ tài liệu nội bộ',
      'Hỏi đáp theo tài liệu',
      'Hỗ trợ SFA / Solution Forming',
      'Chuẩn hóa cách hình thành giải pháp',
      'Giảm thời gian tìm kiếm và tổng hợp',
    ],
    messageLine: 'Không thay người làm proposal — giúp có điểm xuất phát tốt hơn, nhanh hơn, dựa trên tri thức ATS.',
  },
  3: {
    module: 'Co-Builder',
    tagline: 'Technical Build Pipeline',
    stepLabel: 'Bước 3 · Thiết kế kỹ thuật',
    items: [
      'Quản lý project / template',
      'Upload & kiểm tra dữ liệu đầu vào',
      'Theo dõi trạng thái xử lý',
      'Phân tích dữ liệu kỹ thuật ngành điện',
      'Sinh CIM · CID · SCD · OA Server project',
    ],
    messageLine: 'Hướng tới tự động hóa một phần quá trình build kỹ thuật.',
  },
}

export const viBeats = [
  { id: 'define', phase: 'platform' },
  { id: 'layer-knowledge', phase: 'platform', activeLayer: 'knowledge' },
  { id: 'layer-assistant', phase: 'platform', activeLayer: 'assistant' },
  { id: 'layer-workflow', phase: 'platform', activeLayer: 'workflow' },
  { id: 'transition', phase: 'platform' },
  { id: 'lifecycle-scope', phase: 'lifecycle', interactiveFlow: true },
]

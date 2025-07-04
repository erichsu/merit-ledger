# 功德辦理系統 - 技術規格書

## 文件資訊

- **文件版本**: v1.0
- **建立日期**: 2024 年 01 月 01 日
- **最後更新**: 2024 年 01 月 01 日
- **文件狀態**: 初版
- **撰寫者**: 系統架構師
- **審核者**: 技術總監

## 專案概述

### 系統目標

開發一套完整的功德辦理系統，支援佛教寺院的功德業務管理，包含蓮友管理、法會功德、報名繳費、掛單系統等功能，並支援本山與台中兩個分院的獨立運作與資料共享。

### 系統特色

- **多分院支援**: 本山/台中分院資料隔離與共享
- **複雜群組管理**: 支援樹狀群組結構與關聯關係
- **完整列印功能**: 支援各類牌位、報表、證件列印
- **自動化流程**: 自動續立、到期提醒、資料檢核
- **權限控制**: 細粒度權限管理與稽核追蹤

## 技術架構

### 整體架構圖

```mermaid
graph TB
    subgraph "用戶端"
        A[Web瀏覽器]
        B[平板設備]
        C[手機設備]
    end

    subgraph "前端層"
        D[Nuxt.js應用]
        E[Vue組件庫]
        F[Pinia狀態管理]
    end

    subgraph "API層"
        G[GraphQL Gateway]
        H[身份驗證]
        I[授權控制]
    end

    subgraph "業務邏輯層"
        J[蓮友管理服務]
        K[法會功德服務]
        L[報名繳費服務]
        M[掛單管理服務]
        N[報表服務]
        O[權限管理服務]
    end

    subgraph "資料存取層"
        P[Prisma ORM]
        Q[資料驗證]
        R[快取層]
    end

    subgraph "資料庫層"
        S[PostgreSQL主庫]
        T[Redis快取]
        U[檔案儲存]
    end

    subgraph "基礎設施"
        V[Docker容器]
        W[負載均衡器]
        X[監控系統]
    end

    A --> D
    B --> D
    C --> D
    D --> E
    D --> F
    D --> G
    G --> H
    G --> I
    H --> J
    I --> J
    J --> P
    K --> P
    L --> P
    M --> P
    N --> P
    O --> P
    P --> Q
    P --> R
    Q --> S
    R --> T
    S --> U
    D --> V
    G --> V
    V --> W
    W --> X
```

### 技術棧選型

#### 前端技術棧

- **框架**: Nuxt.js 3.8+
  - 理由: SSR 支援、SEO 友好、Vue 生態系完整
  - 配置: SPA 模式，支援 PWA
- **UI 框架**: Quasar Framework 2.14+
  - 理由: 組件豐富、響應式設計、列印支援優秀
  - 配置: Material Design 風格
- **狀態管理**: Pinia 2.1+
  - 理由: Vue 3 官方推薦、TypeScript 支援完整
- **資料獲取**: Apollo Client 3.8+
  - 理由: GraphQL 客戶端、快取機制、離線支援
  - 擴展性: 同一 GraphQL API 可供 Mobile App 使用
- **圖表庫**: Chart.js 4.4+
  - 理由: 輕量、客製化彈性高、列印相容性好
- **列印功能**: Print.js + CSS Print Media
  - 理由: 跨瀏覽器相容、格式控制精確
- **Mobile App 預備**: Flutter 3.13+
  - 理由: 單一程式碼庫、UI 一致性佳、與 GraphQL 整合良好
  - 配置: Material Design 3.0、graphql_flutter 套件

#### 後端技術棧

- **API 框架**: GraphQL (Apollo Server 4.9+)
  - 理由: 靈活的資料查詢、強型別、自動生成文檔
  - 配置: Schema 優先開發、訂閱功能
- **執行環境**: Node.js 18.18+ LTS
  - 理由: 穩定性、生態系豐富、效能優秀
- **ORM**: Prisma 5.6+
  - 理由: 型別安全、資料庫遷移、查詢優化
- **資料庫**: PostgreSQL 15+
  - 理由: 關聯式資料庫、JSON 支援、全文搜尋
- **快取**: Redis 7.2+
  - 理由: 高效能、多種資料結構、持久化
- **身份認證**: JWT + bcrypt
  - 理由: 無狀態、可擴展、安全性高

#### 基礎設施

- **容器化**: Docker 24.0+ & Docker Compose
  - 理由: 環境一致性、部署便利性
- **CI/CD**: GitHub Actions
  - 理由: 免費、整合度高、配置靈活
- **雲端平台**: AWS/Azure/GCP (建議 AWS)
  - 理由: 服務完整、穩定性高、擴展性佳
- **監控**: Sentry + Grafana + Prometheus
  - 理由: 錯誤追蹤、效能監控、告警機制

### 資料庫設計

#### 核心資料表結構

```sql
-- 蓮友基本資料表
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_no VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(10),
    phone VARCHAR(20),
    mobile VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    temple_id UUID REFERENCES temples(id),
    group_id UUID REFERENCES member_groups(id),

    -- 索引
    INDEX idx_member_no (member_no),
    INDEX idx_name (name),
    INDEX idx_phone (phone),
    INDEX idx_mobile (mobile),
    INDEX idx_temple_id (temple_id),
    INDEX idx_group_id (group_id)
);

-- 群組關係表
CREATE TABLE member_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    parent_id UUID REFERENCES member_groups(id),
    path TEXT, -- 樹狀路徑，如：/root/group1/subgroup1
    level INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    temple_id UUID REFERENCES temples(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 索引
    INDEX idx_parent_id (parent_id),
    INDEX idx_path (path),
    INDEX idx_temple_id (temple_id)
);

-- 法會資料表
CREATE TABLE dharma_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    temple_id UUID REFERENCES temples(id),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 索引
    INDEX idx_temple_id (temple_id),
    INDEX idx_start_date (start_date),
    INDEX idx_status (status)
);

-- 功德項目表
CREATE TABLE merit_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES dharma_events(id),
    name VARCHAR(200) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    item_type VARCHAR(50) NOT NULL, -- 'memorial', 'lamp', 'offering', etc.
    temple_id UUID REFERENCES temples(id),

    -- 索引
    INDEX idx_event_id (event_id),
    INDEX idx_temple_id (temple_id),
    INDEX idx_item_type (item_type)
);

-- 功德報名表
CREATE TABLE merit_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_no VARCHAR(30) UNIQUE NOT NULL,
    member_id UUID REFERENCES members(id),
    merit_item_id UUID REFERENCES merit_items(id),
    amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    memorial_names TEXT[], -- 牌位名稱陣列
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 索引
    INDEX idx_registration_no (registration_no),
    INDEX idx_member_id (member_id),
    INDEX idx_merit_item_id (merit_item_id),
    INDEX idx_status (status)
);

-- 掛單系統 - 寮房表
CREATE TABLE dormitory_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    room_no VARCHAR(20) NOT NULL,
    capacity INTEGER NOT NULL,
    gender VARCHAR(10), -- 'male', 'female', 'mixed'
    room_type VARCHAR(20), -- 'perfect', 'random'
    temple_id UUID REFERENCES temples(id),

    -- 索引
    INDEX idx_temple_id (temple_id),
    INDEX idx_room_no (room_no)
);

-- 掛單登記表
CREATE TABLE accommodation_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_no VARCHAR(30) UNIQUE NOT NULL,
    member_id UUID REFERENCES members(id),
    room_id UUID REFERENCES dormitory_rooms(id),
    event_id UUID REFERENCES dharma_events(id),
    check_in_date DATE NOT NULL,
    check_out_date DATE,
    status VARCHAR(20) DEFAULT 'booked',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 索引
    INDEX idx_booking_no (booking_no),
    INDEX idx_member_id (member_id),
    INDEX idx_room_id (room_id),
    INDEX idx_event_id (event_id)
);
```

#### 資料庫優化策略

1. **索引優化**

   - 主鍵使用 UUID，分散 I/O 負載
   - 常用查詢欄位建立複合索引
   - 定期分析查詢計劃並調整索引

2. **分區策略**

   - 按日期分區歷史資料
   - 按 temple_id 分區不同分院資料
   - 自動歸檔過期資料

3. **查詢優化**
   - 使用 PostgreSQL 的 GIN 索引支援全文搜尋
   - 實作查詢結果快取機制
   - 使用資料庫連線池

### GraphQL Schema 設計

```graphql
# 蓮友資料型別
type Member {
  id: ID!
  memberNo: String!
  name: String!
  gender: Gender
  phone: String
  mobile: String
  email: String
  address: String
  group: MemberGroup
  temple: Temple!
  registrations: [MeritRegistration!]!
  bookings: [AccommodationBooking!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

# 群組資料型別
type MemberGroup {
  id: ID!
  name: String!
  parent: MemberGroup
  children: [MemberGroup!]!
  path: String!
  level: Int!
  members: [Member!]!
  temple: Temple!
}

# 法會資料型別
type DharmaEvent {
  id: ID!
  name: String!
  startDate: Date!
  endDate: Date!
  temple: Temple!
  status: EventStatus!
  meritItems: [MeritItem!]!
  registrations: [MeritRegistration!]!
  bookings: [AccommodationBooking!]!
}

# 功德項目型別
type MeritItem {
  id: ID!
  name: String!
  amount: Decimal!
  itemType: MeritItemType!
  event: DharmaEvent!
  temple: Temple!
  registrations: [MeritRegistration!]!
}

# 功德報名型別
type MeritRegistration {
  id: ID!
  registrationNo: String!
  member: Member!
  meritItem: MeritItem!
  amount: Decimal!
  paidAmount: Decimal!
  status: RegistrationStatus!
  memorialNames: [String!]!
  remarks: String
  createdAt: DateTime!
}

# 查詢定義
type Query {
  # 蓮友查詢
  members(filter: MemberFilter, pagination: PaginationInput): MemberConnection!

  member(id: ID!): Member

  # 群組查詢
  memberGroups(templeId: ID!): [MemberGroup!]!

  # 法會查詢
  dharmaEvents(
    filter: DharmaEventFilter
    pagination: PaginationInput
  ): DharmaEventConnection!

  # 功德查詢
  meritRegistrations(
    filter: MeritRegistrationFilter
    pagination: PaginationInput
  ): MeritRegistrationConnection!

  # 掛單查詢
  accommodationBookings(
    filter: AccommodationBookingFilter
    pagination: PaginationInput
  ): AccommodationBookingConnection!

  # 統計查詢
  memberStatistics(templeId: ID!): MemberStatistics!
  revenueStatistics(
    templeId: ID!
    dateRange: DateRangeInput!
  ): RevenueStatistics!
}

# 變更定義
type Mutation {
  # 蓮友管理
  createMember(input: CreateMemberInput!): Member!
  updateMember(id: ID!, input: UpdateMemberInput!): Member!
  deleteMember(id: ID!): Boolean!

  # 群組管理
  createMemberGroup(input: CreateMemberGroupInput!): MemberGroup!
  updateMemberGroup(id: ID!, input: UpdateMemberGroupInput!): MemberGroup!
  deleteMemberGroup(id: ID!): Boolean!

  # 法會管理
  createDharmaEvent(input: CreateDharmaEventInput!): DharmaEvent!
  updateDharmaEvent(id: ID!, input: UpdateDharmaEventInput!): DharmaEvent!

  # 功德報名
  createMeritRegistration(
    input: CreateMeritRegistrationInput!
  ): MeritRegistration!
  updateMeritRegistration(
    id: ID!
    input: UpdateMeritRegistrationInput!
  ): MeritRegistration!

  # 繳費處理
  processPayment(input: ProcessPaymentInput!): MeritRegistration!
  refundPayment(input: RefundPaymentInput!): MeritRegistration!

  # 掛單管理
  createAccommodationBooking(
    input: CreateAccommodationBookingInput!
  ): AccommodationBooking!
  updateAccommodationBooking(
    id: ID!
    input: UpdateAccommodationBookingInput!
  ): AccommodationBooking!
  checkIn(bookingId: ID!): AccommodationBooking!
  checkOut(bookingId: ID!): AccommodationBooking!
}

# 訂閱定義
type Subscription {
  # 即時通知
  memberUpdated(templeId: ID!): Member!
  registrationStatusChanged(templeId: ID!): MeritRegistration!
  roomOccupancyChanged(templeId: ID!): DormitoryRoom!
}
```

### 前端架構設計

#### 目錄結構

```
src/
├── components/           # 共用組件
│   ├── common/          # 通用組件
│   ├── forms/           # 表單組件
│   ├── tables/          # 表格組件
│   └── charts/          # 圖表組件
├── pages/               # 頁面組件
│   ├── members/         # 蓮友管理
│   ├── events/          # 法會管理
│   ├── registrations/   # 報名管理
│   ├── accommodations/  # 掛單管理
│   └── reports/         # 報表管理
├── composables/         # 可重用組合式函數
├── stores/              # Pinia狀態管理
├── graphql/             # GraphQL查詢與變更
├── types/               # TypeScript型別定義
├── utils/               # 工具函數
└── plugins/             # Nuxt插件
```

#### 核心組件設計

1. **資料表格組件**

```vue
<template>
  <DataTable
    :columns="columns"
    :data="data"
    :loading="loading"
    :pagination="pagination"
    @update:pagination="onPaginationChange"
    @row-click="onRowClick"
  >
    <template #toolbar>
      <q-btn color="primary" @click="createNew">新增</q-btn>
      <q-btn color="secondary" @click="exportData">匯出</q-btn>
    </template>
  </DataTable>
</template>
```

2. **表單組件**

```vue
<template>
  <FormWrapper
    :schema="formSchema"
    :initial-values="initialValues"
    :validation-schema="validationSchema"
    @submit="onSubmit"
  >
    <template #actions>
      <q-btn type="submit" color="primary">儲存</q-btn>
      <q-btn type="button" @click="onCancel">取消</q-btn>
    </template>
  </FormWrapper>
</template>
```

#### 狀態管理設計

```typescript
// stores/members.ts
export const useMemberStore = defineStore("members", {
  state: () => ({
    members: [] as Member[],
    selectedMember: null as Member | null,
    loading: false,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
    },
  }),

  getters: {
    getMemberById: (state) => (id: string) =>
      state.members.find((m) => m.id === id),

    getMembersByGroup: (state) => (groupId: string) =>
      state.members.filter((m) => m.group?.id === groupId),
  },

  actions: {
    async fetchMembers(filter?: MemberFilter) {
      this.loading = true;
      try {
        const { data } = await $fetch("/api/graphql", {
          method: "POST",
          body: {
            query: GET_MEMBERS_QUERY,
            variables: { filter },
          },
        });
        this.members = data.members.nodes;
        this.pagination = data.members.pageInfo;
      } catch (error) {
        console.error("Failed to fetch members:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createMember(input: CreateMemberInput) {
      const { data } = await $fetch("/api/graphql", {
        method: "POST",
        body: {
          query: CREATE_MEMBER_MUTATION,
          variables: { input },
        },
      });
      this.members.push(data.createMember);
      return data.createMember;
    },
  },
});
```

### 後端服務架構

#### 服務層設計

```typescript
// services/MemberService.ts
export class MemberService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findMembers(
    filter: MemberFilter,
    pagination: PaginationInput,
    templeId: string
  ): Promise<MemberConnection> {
    const where = {
      templeId,
      ...(filter.name && {
        name: { contains: filter.name, mode: "insensitive" },
      }),
      ...(filter.memberNo && {
        memberNo: { contains: filter.memberNo },
      }),
      ...(filter.groupId && {
        groupId: filter.groupId,
      }),
    };

    const [members, total] = await Promise.all([
      this.prisma.member.findMany({
        where,
        include: {
          group: true,
          temple: true,
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.member.count({ where }),
    ]);

    return {
      nodes: members,
      pageInfo: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async createMember(
    input: CreateMemberInput,
    userId: string,
    templeId: string
  ): Promise<Member> {
    // 檢查會員編號是否重複
    const existingMember = await this.prisma.member.findFirst({
      where: { memberNo: input.memberNo, templeId },
    });

    if (existingMember) {
      throw new Error("會員編號已存在");
    }

    // 建立新會員
    const member = await this.prisma.member.create({
      data: {
        ...input,
        templeId,
        createdBy: userId,
        updatedBy: userId,
      },
      include: {
        group: true,
        temple: true,
      },
    });

    return member;
  }
}
```

#### GraphQL Resolver 設計

```typescript
// resolvers/MemberResolver.ts
@Resolver(Member)
export class MemberResolver {
  constructor(private memberService: MemberService) {}

  @Query(() => MemberConnection)
  async members(
    @Args("filter", { nullable: true }) filter: MemberFilter,
    @Args("pagination") pagination: PaginationInput,
    @Context() context: GraphQLContext
  ): Promise<MemberConnection> {
    const { user } = context;
    return this.memberService.findMembers(filter, pagination, user.templeId);
  }

  @Mutation(() => Member)
  async createMember(
    @Args("input") input: CreateMemberInput,
    @Context() context: GraphQLContext
  ): Promise<Member> {
    const { user } = context;
    return this.memberService.createMember(input, user.id, user.templeId);
  }

  @ResolveField()
  async registrations(@Parent() member: Member): Promise<MeritRegistration[]> {
    return this.memberService.findMemberRegistrations(member.id);
  }
}
```

### 安全性設計

#### 認證與授權

1. **JWT Token 設計**

```typescript
interface JWTPayload {
  sub: string; // 使用者ID
  email: string; // 使用者Email
  templeId: string; // 所屬寺院ID
  roles: string[]; // 使用者角色
  permissions: string[]; // 使用者權限
  iat: number; // 簽發時間
  exp: number; // 過期時間
}
```

2. **權限控制**

```typescript
// 權限裝飾器
@Guard('member:read')
async getMembers() {
  // 只有擁有 member:read 權限的使用者可以存取
}

@Guard('member:write', 'temple:same')
async createMember() {
  // 需要 member:write 權限且只能操作同一寺院的資料
}
```

3. **資料隔離**

```typescript
// 自動添加寺院過濾條件
class TempleDataFilter {
  static apply(query: any, user: User): any {
    if (!user.isSuperAdmin) {
      query.where = {
        ...query.where,
        templeId: user.templeId,
      };
    }
    return query;
  }
}
```

#### 資料驗證

1. **輸入驗證**

```typescript
// 使用Zod進行資料驗證
const CreateMemberSchema = z.object({
  memberNo: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().max(500).optional(),
});
```

2. **SQL 注入防護**

```typescript
// 使用Prisma ORM防止SQL注入
const members = await prisma.member.findMany({
  where: {
    name: { contains: searchTerm }, // 自動轉義
    templeId: templeId,
  },
});
```

### 效能優化

#### 資料庫層優化

1. **查詢優化**

```sql
-- 使用索引優化常用查詢
CREATE INDEX CONCURRENTLY idx_members_name_temple
ON members (name, temple_id);

-- 使用部分索引
CREATE INDEX idx_active_registrations
ON merit_registrations (member_id, status)
WHERE status = 'active';
```

2. **連線池配置**

```typescript
// Prisma連線池配置
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + "?connection_limit=20&pool_timeout=60",
    },
  },
});
```

#### 應用層優化

1. **GraphQL 查詢優化**

```typescript
// 使用DataLoader防止N+1查詢
const memberLoader = new DataLoader(async (memberIds: string[]) => {
  const members = await prisma.member.findMany({
    where: { id: { in: memberIds } },
    include: { group: true },
  });
  return memberIds.map((id) => members.find((member) => member.id === id));
});
```

2. **快取策略**

```typescript
// Redis快取常用資料
const cacheKey = `member:${memberId}`;
const cachedMember = await redis.get(cacheKey);

if (!cachedMember) {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
  });
  await redis.setex(cacheKey, 3600, JSON.stringify(member));
  return member;
}

return JSON.parse(cachedMember);
```

#### 前端效能優化

1. **組件懶載入**

```typescript
// 路由層級的程式碼分割
const MemberManagement = defineAsyncComponent(
  () => import("~/pages/members/index.vue")
);
```

2. **虛擬滾動**

```vue
<template>
  <q-virtual-scroll :items="members" :item-size="60" v-slot="{ item }">
    <MemberListItem :member="item" />
  </q-virtual-scroll>
</template>
```

### 列印功能設計

#### 列印架構

```typescript
// 列印服務
class PrintService {
  async generateReport(
    template: string,
    data: any,
    options: PrintOptions
  ): Promise<string> {
    // 使用Puppeteer生成PDF
    const html = await this.renderTemplate(template, data);
    const pdf = await this.generatePDF(html, options);
    return pdf;
  }

  private async renderTemplate(template: string, data: any): Promise<string> {
    // 使用Handlebars渲染模板
    const compiledTemplate = Handlebars.compile(template);
    return compiledTemplate(data);
  }
}
```

#### 列印範本

```html
<!-- 牌位列印範本 -->
<div class="memorial-tablet">
  <div class="temple-name">{{templeName}}</div>
  <div class="event-name">{{eventName}}</div>
  <div class="memorial-names">
    {{#each memorialNames}}
    <div class="name">{{this}}</div>
    {{/each}}
  </div>
  <div class="sponsor">{{sponsorName}}</div>
</div>
```

### 部署與維運

#### Docker 容器化

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runtime

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000
CMD ["npm", "start"]
```

#### Docker Compose 配置

```yaml
# docker-compose.yml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/merit_system
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=merit_system
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

#### 監控配置

```yaml
# monitoring/docker-compose.yml
version: "3.8"

services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  grafana_data:
```

## 測試策略

### 測試金字塔

1. **單元測試 (70%)**

   - 使用 Vitest 進行前端組件測試
   - 使用 Jest 進行後端服務測試
   - 覆蓋率目標：80%以上

2. **整合測試 (20%)**

   - API 整合測試
   - 資料庫整合測試
   - 第三方服務整合測試

3. **端到端測試 (10%)**
   - 使用 Cypress 進行關鍵流程測試
   - 跨瀏覽器相容性測試
   - 行動裝置測試

### 測試環境

```typescript
// 測試配置
export const testConfig = {
  database: {
    url: "postgresql://test:test@localhost:5433/merit_system_test",
  },
  redis: {
    url: "redis://localhost:6380",
  },
  jwt: {
    secret: "test-secret",
  },
};
```

## 效能指標

### 效能目標

- **頁面載入時間**: < 2 秒
- **API 響應時間**: < 500ms
- **資料庫查詢**: < 100ms
- **同時在線用戶**: 100 人
- **系統可用性**: 99.5%

### 監控指標

```typescript
// 效能監控
const performanceMetrics = {
  // 應用效能
  responseTime: "p95 < 500ms",
  throughput: "> 1000 req/min",
  errorRate: "< 0.1%",

  // 資料庫效能
  queryTime: "p95 < 100ms",
  connectionPool: "< 80% usage",

  // 基礎設施
  cpuUsage: "< 70%",
  memoryUsage: "< 80%",
  diskUsage: "< 85%",
};
```

## 擴展性設計

### 水平擴展

- 使用負載均衡器分散流量
- 資料庫讀寫分離
- 應用伺服器無狀態設計

### 垂直擴展

- 支援資源動態調整
- 自動擴展機制
- 效能瓶頸監控

### 微服務遷移準備

```typescript
// 服務模組化設計
interface ServiceModule {
  name: string;
  version: string;
  dependencies: string[];
  api: GraphQLSchema;
}

const services: ServiceModule[] = [
  {
    name: "member-service",
    version: "1.0.0",
    dependencies: ["auth-service"],
    api: memberSchema,
  },
  {
    name: "merit-service",
    version: "1.0.0",
    dependencies: ["member-service"],
    api: meritSchema,
  },
];
```

## 災難恢復計劃

### 備份策略

- 資料庫每日自動備份
- 異地備份存儲
- 備份完整性驗證

### 恢復流程

1. 故障檢測與告警
2. 切換到備用系統
3. 資料恢復與驗證
4. 服務恢復上線

### RTO/RPO 目標

- **RTO (Recovery Time Objective)**: 4 小時
- **RPO (Recovery Point Objective)**: 1 小時

## 未來發展規劃

### 第二階段功能

- 行動應用程式開發
- 進階資料分析功能
- 多語言支援

### 第三階段功能

- AI 輔助功能
- 區塊鏈整合
- IoT 設備整合

### 技術演進

- 微服務架構遷移
- 雲原生技術應用
- 邊緣計算支援

---

_本技術規格書將隨著專案進展持續更新，確保技術實現與業務需求保持一致。_

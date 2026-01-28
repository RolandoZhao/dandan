# Lovable 协同指令

> 本仓库包含完整的项目代码和设计文档。

## 快速开始

```
请基于本仓库代码，帮我完成以下优化：

1. 配置 Supabase 数据同步（替换 localStorage）
2. 添加密码保护页面（密码：dandan）
3. 配置 PWA（使用 apple_logo.png 作为桌面图标）

图片资源已在仓库根目录：
- logo.png → 丹丹头像
- apple_logo.png → 臭臭猫猫头像
```

## Supabase 表结构

```sql
-- 在 Supabase SQL Editor 中执行

create table checklist_items (
  id uuid primary key default gen_random_uuid(),
  item_key text not null,
  user_name text not null check (user_name in ('金宝', '丹丹')),
  checked boolean default false,
  created_at timestamptz default now(),
  unique(item_key, user_name)
);

create table todos (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  owner text not null check (owner in ('金宝', '丹丹')),
  completed boolean default false,
  created_at timestamptz default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  author text not null check (author in ('金宝', '丹丹')),
  content text not null,
  created_at timestamptz default now()
);

alter publication supabase_realtime add table checklist_items;
alter publication supabase_realtime add table todos;
alter publication supabase_realtime add table messages;
```

## 设计规范

| 项目 | 值 |
|------|-----|
| 主色 | #E85A4F（珊瑚红） |
| 强调色 | #667EEA（紫） |
| 金宝色 | #3B82F6（蓝） |
| 丹丹色 | #EC4899（粉） |
| 中文字体 | Noto Serif SC / Noto Sans SC |
| 密码 | dandan |

## 核心功能

- ✅ 杂志风格首页（已实现）
- ✅ 双列清单勾选（已实现）
- ✅ 浮动留言按钮（已实现）
- ⏳ Supabase 数据同步（待接入）
- ⏳ 密码保护页面（待添加）
- ⏳ PWA 桌面图标（待配置）

详细实现说明见 `Lovable指令_丹丹粉雪之旅.md`

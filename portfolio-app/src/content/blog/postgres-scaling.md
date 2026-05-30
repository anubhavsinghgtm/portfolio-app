---
title: Optimizing Postgres Queries for Multi-Tenant Scale
category: Engineering
date: May 25, 2026
readingTime: 2 min read
draft: true
excerpt: Exploring the details of index design, query optimization, and structural partition keys to scale multi-tenant databases past billions of rows without latency degradation.
---

## The Scaling Bottleneck

When scaling multi-tenant databases, queries that previously executed in sub-milliseconds begin to degrade. Under a heavy transaction payload, typical index lookups face a linear execution slowdown as the index B-Tree height grows.

Here is what we did to scale our Postgres clusters past billions of rows while maintaining a sub-10ms response boundary.

### 1. Partitioning by Tenant Key

Rather than storing all customers in one massive, flat table, we implemented declarative partitioning on our highest-volume transaction tables:

```sql
CREATE TABLE transaction_records (
    id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) PARTITION BY HASH (tenant_id);
```

By hashing on `tenant_id`, PostgreSQL automatically routes query operations to small, isolated child partitions. This keeps individual B-Tree heights extremely short and highly cacheable in RAM.

### 2. Indexes and Partial Scans

A common mistake is indexing nullable columns globally. Instead, use partial indexes to exclude uninteresting records:

```sql
CREATE INDEX idx_pending_orders 
ON orders (tenant_id, created_at) 
WHERE status = 'pending';
```

This creates an index that is only 5% of the size of a full index, ensuring quick traversals.

> [!NOTE]
> Always check query execution plans using `EXPLAIN ANALYZE`. Watch out for unexpected sequential scans on child tables and adjust partition pruning settings (`set enable_partition_pruning = on`).

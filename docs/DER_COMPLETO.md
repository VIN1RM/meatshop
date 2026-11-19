# DER completo do Meatshop

Esquema reconstruído a partir das **75 migrations** do repositório, em PostgreSQL isolado em memória (PGlite), sem acessar o banco da aplicação ou ler arquivos `.env`. São **61 tabelas**, **95 FKs** e **10 vínculos lógicos documentados**. A tabela interna de controle do TypeORM (`migrations`) não é criada pelas migrations e não faz parte deste levantamento.

[Abrir imagem SVG completa](DER_COMPLETO.svg) · [Imagem PNG completa](DER_COMPLETO.png) · [Fonte Mermaid](DER_ATUALIZADO.mmd) · [Snapshot do esquema](DER_SCHEMA.json)

![DER completo; abra o SVG para ampliar e ler todos os atributos](DER_COMPLETO.svg)

## Como ler

A imagem apresenta cada tabela com todos os atributos. Ao lado de cada tabela ficam os nós de referência dos seus pais, ligados por setas rotuladas com a FK e a cardinalidade. Os nós de referência repetem nomes para evitar cruzamentos entre dezenas de linhas; a definição completa de cada tabela aparece uma única vez. Setas contínuas são FKs e tracejadas são vínculos lógicos sem integridade referencial declarada. Amplie o SVG para ler os campos ou use as imagens por área abaixo.

`PK`: chave primária; `FK`: chave estrangeira; `UK`: unicidade de uma coluna. Chaves compostas e índices únicos parciais estão descritos nas restrições e índices de cada entidade. `NULL` informa se o atributo é opcional. A cardinalidade é apresentada na ordem **pai : filho**: `1 : 0..N` significa que cada filho exige um pai e cada pai pode ter nenhum ou vários filhos. `0..1 : 0..N` permite que o filho não tenha pai. Uma FK não obriga o pai a ter filhos.

## Imagens por área

- [Identidade e unidades](der/area-1.svg)
- [Catálogo e compras](der/area-2.svg)
- [Pedidos e avaliações](der/area-3.svg)
- [Entregadores e financeiro](der/area-4.svg)
- [Operações de pagamentos](der/area-5.svg)
- [Suporte e notificações](der/area-6.svg)
- [Receitas](der/area-7.svg)
- [IA, documentos e infraestrutura](der/area-8.svg)

## Entidades e atributos

### Identidade e unidades

#### User — `users`

Contas, identidade, autenticação e perfil de acesso.

Fonte: [user.entity.ts](../meatshop-backend/src/users/entities/user.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('users_id_seq'::regclass)` |
| `name` | `varchar(100)` | — | sim | `—` |
| `email` | `varchar` | UK | não | `—` |
| `cpf` | `varchar` | — | sim | `—` |
| `password_hash` | `varchar` | — | sim | `—` |
| `global_role` | `users_global_role_enum` | — | não | `'USER'::users_global_role_enum` |
| `app_profile` | `users_app_profile_enum` | — | sim | `—` |
| `failed_login_attempts` | `integer` | — | não | `0` |
| `locked_until` | `timestamp` | — | sim | `—` |
| `email_verified` | `boolean` | — | não | `false` |
| `email_verification_token` | `varchar` | — | sim | `—` |
| `password_reset_token` | `varchar` | — | sim | `—` |
| `password_reset_expires_at` | `timestamp` | — | sim | `—` |
| `created_at` | `timestamp` | — | não | `now()` |
| `avatar_url` | `varchar` | — | sim | `—` |
| `firebase_uid` | `varchar` | — | sim | `—` |
| `phone` | `varchar` | — | sim | `—` |
| `profile_complete` | `boolean` | — | não | `false` |
| `is_active` | `boolean` | — | não | `true` |
| `cpf_hash` | `varchar(64)` | UK | sim | `—` |
| `phone_hash` | `varchar(64)` | UK | sim | `—` |

Restrições e índices:

- `PK_users`: `PRIMARY KEY (id)`.
- `UQ_users_email`: `UNIQUE (email)`.
- `users_created_at_not_null`: `NOT NULL created_at`.
- `users_email_not_null`: `NOT NULL email`.
- `users_email_verified_not_null`: `NOT NULL email_verified`.
- `users_failed_login_attempts_not_null`: `NOT NULL failed_login_attempts`.
- `users_global_role_not_null`: `NOT NULL global_role`.
- `users_id_not_null`: `NOT NULL id`.
- `users_is_active_not_null`: `NOT NULL is_active`.
- `users_profile_complete_not_null`: `NOT NULL profile_complete`.
- `PK_users`: `CREATE UNIQUE INDEX "PK_users" ON public.users USING btree (id)`.
- `UQ_users_cpf_hash`: `CREATE UNIQUE INDEX "UQ_users_cpf_hash" ON public.users USING btree (cpf_hash)`.
- `UQ_users_email`: `CREATE UNIQUE INDEX "UQ_users_email" ON public.users USING btree (email)`.
- `UQ_users_firebase_uid`: `CREATE UNIQUE INDEX "UQ_users_firebase_uid" ON public.users USING btree (firebase_uid) WHERE (firebase_uid IS NOT NULL)`.
- `UQ_users_phone_hash`: `CREATE UNIQUE INDEX "UQ_users_phone_hash" ON public.users USING btree (phone_hash)`.

#### Address — `addresses`

Endereços e coordenadas dos usuários.

Fonte: [address.entity.ts](../meatshop-backend/src/users/entities/address.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('addresses_id_seq'::regclass)` |
| `user_id` | `integer` | FK | não | `—` |
| `street` | `varchar(150)` | — | não | `—` |
| `number` | `varchar(20)` | — | não | `—` |
| `complement` | `varchar(100)` | — | sim | `—` |
| `neighborhood` | `varchar(100)` | — | não | `—` |
| `city` | `varchar(80)` | — | não | `—` |
| `state` | `varchar(2)` | — | não | `—` |
| `zip_code` | `varchar(10)` | — | não | `—` |
| `label` | `addresses_label_enum` | — | não | `—` |
| `is_default` | `boolean` | — | não | `false` |
| `latitude` | `numeric(10,7)` | — | sim | `—` |
| `longitude` | `numeric(10,7)` | — | sim | `—` |
| `coordinate_source` | `varchar(20)` | — | não | `'POSTAL_CODE'::character varying` |

Restrições e índices:

- `FK_addresses_user_id`: `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`.
- `PK_addresses`: `PRIMARY KEY (id)`.
- `addresses_city_not_null`: `NOT NULL city`.
- `addresses_coordinate_source_not_null`: `NOT NULL coordinate_source`.
- `addresses_id_not_null`: `NOT NULL id`.
- `addresses_is_default_not_null`: `NOT NULL is_default`.
- `addresses_label_not_null`: `NOT NULL label`.
- `addresses_neighborhood_not_null`: `NOT NULL neighborhood`.
- `addresses_number_not_null`: `NOT NULL number`.
- `addresses_state_not_null`: `NOT NULL state`.
- `addresses_street_not_null`: `NOT NULL street`.
- `addresses_user_id_not_null`: `NOT NULL user_id`.
- `addresses_zip_code_not_null`: `NOT NULL zip_code`.
- `PK_addresses`: `CREATE UNIQUE INDEX "PK_addresses" ON public.addresses USING btree (id)`.
- `UQ_addresses_user_default`: `CREATE UNIQUE INDEX "UQ_addresses_user_default" ON public.addresses USING btree (user_id) WHERE (is_default = true)`.

#### RefreshToken — `refresh_tokens`

Sessões renováveis e revogação de tokens.

Fonte: [refresh-token.entity.ts](../meatshop-backend/src/auth/entities/refresh-token.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('refresh_tokens_id_seq'::regclass)` |
| `token_hash` | `text` | — | não | `—` |
| `user_id` | `integer` | FK | não | `—` |
| `revoked` | `boolean` | — | não | `false` |
| `expires_at` | `timestamp` | — | não | `—` |
| `created_at` | `timestamp` | — | não | `now()` |
| `authenticated_at` | `timestamp` | — | não | `now()` |

Restrições e índices:

- `FK_refresh_tokens_user_id`: `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`.
- `PK_refresh_tokens`: `PRIMARY KEY (id)`.
- `refresh_tokens_authenticated_at_not_null`: `NOT NULL authenticated_at`.
- `refresh_tokens_created_at_not_null`: `NOT NULL created_at`.
- `refresh_tokens_expires_at_not_null`: `NOT NULL expires_at`.
- `refresh_tokens_id_not_null`: `NOT NULL id`.
- `refresh_tokens_revoked_not_null`: `NOT NULL revoked`.
- `refresh_tokens_token_hash_not_null`: `NOT NULL token_hash`.
- `refresh_tokens_user_id_not_null`: `NOT NULL user_id`.
- `PK_refresh_tokens`: `CREATE UNIQUE INDEX "PK_refresh_tokens" ON public.refresh_tokens USING btree (id)`.

#### AuthLoginAttempts — `auth_login_attempts`

Controle de tentativas de login por hash de identidade, sem FK para usuário.

Fonte: [1792790400000-CompleteFunctionalGaps.ts](../meatshop-backend/src/database/migrations/1792790400000-CompleteFunctionalGaps.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `identity_hash` | `varchar(64)` | PK | não | `—` |
| `failed_attempts` | `integer` | — | não | `0` |
| `locked_until` | `timestamptz` | — | sim | `—` |
| `updated_at` | `timestamptz` | — | não | `now()` |

Restrições e índices:

- `auth_login_attempts_failed_attempts_check`: `CHECK (((failed_attempts >= 0) AND (failed_attempts <= 4)))`.
- `auth_login_attempts_failed_attempts_not_null`: `NOT NULL failed_attempts`.
- `auth_login_attempts_identity_hash_not_null`: `NOT NULL identity_hash`.
- `auth_login_attempts_pkey`: `PRIMARY KEY (identity_hash)`.
- `auth_login_attempts_updated_at_not_null`: `NOT NULL updated_at`.
- `auth_login_attempts_pkey`: `CREATE UNIQUE INDEX auth_login_attempts_pkey ON public.auth_login_attempts USING btree (identity_hash)`.
- `idx_auth_login_attempts_updated`: `CREATE INDEX idx_auth_login_attempts_updated ON public.auth_login_attempts USING btree (updated_at)`.

#### Unit — `units`

Unidades comerciais, administrador, localização e configuração de entregas.

Fonte: [unit.entity.ts](../meatshop-backend/src/units/entities/unit.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('units_id_seq'::regclass)` |
| `name` | `varchar(100)` | — | não | `—` |
| `cnpj` | `varchar(14)` | UK | não | `—` |
| `city` | `varchar(80)` | — | não | `—` |
| `zip_code` | `varchar(10)` | — | não | `—` |
| `state` | `varchar(2)` | — | não | `—` |
| `admin_id` | `integer` | FK | não | `—` |
| `created_at` | `timestamp` | — | não | `now()` |
| `street` | `varchar(150)` | — | sim | `—` |
| `number` | `varchar(20)` | — | sim | `—` |
| `complement` | `varchar(100)` | — | sim | `—` |
| `neighborhood` | `varchar(80)` | — | sim | `—` |
| `latitude` | `numeric(10,7)` | — | sim | `—` |
| `longitude` | `numeric(10,7)` | — | sim | `—` |
| `image_url` | `varchar` | — | sim | `—` |
| `cover_url` | `varchar` | — | sim | `—` |
| `coordinate_source` | `varchar(20)` | — | não | `'POSTAL_CODE'::character varying` |
| `delivery_radius_km` | `numeric(7,2)` | — | não | `25` |
| `scheduling_slot_minutes` | `integer` | — | sim | `—` |
| `scheduling_capacity` | `integer` | — | sim | `—` |
| `gallery_urls` | `jsonb` | — | não | `'[]'::jsonb` |
| `is_active` | `boolean` | — | não | `true` |

Restrições e índices:

- `CHK_units_scheduling_configuration`: `CHECK ((((scheduling_slot_minutes IS NULL) AND (scheduling_capacity IS NULL)) OR ((scheduling_slot_minutes IS NOT NULL) AND (scheduling_capacity IS NOT NULL) AND ((scheduling_slot_minutes >= 5) AND (scheduling_slot_minutes <= 240)) AND ((scheduling_capacity >= 1) AND (scheduling_capacity <= 1000)))))`.
- `FK_units_admin_id`: `FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE RESTRICT`.
- `PK_units`: `PRIMARY KEY (id)`.
- `UQ_units_cnpj`: `UNIQUE (cnpj)`.
- `units_admin_id_not_null`: `NOT NULL admin_id`.
- `units_city_not_null`: `NOT NULL city`.
- `units_cnpj_not_null`: `NOT NULL cnpj`.
- `units_coordinate_source_not_null`: `NOT NULL coordinate_source`.
- `units_created_at_not_null`: `NOT NULL created_at`.
- `units_delivery_radius_km_not_null`: `NOT NULL delivery_radius_km`.
- `units_gallery_urls_not_null`: `NOT NULL gallery_urls`.
- `units_id_not_null`: `NOT NULL id`.
- `units_is_active_not_null`: `NOT NULL is_active`.
- `units_name_not_null`: `NOT NULL name`.
- `units_state_not_null`: `NOT NULL state`.
- `units_zip_code_not_null`: `NOT NULL zip_code`.
- `PK_units`: `CREATE UNIQUE INDEX "PK_units" ON public.units USING btree (id)`.
- `UQ_units_cnpj`: `CREATE UNIQUE INDEX "UQ_units_cnpj" ON public.units USING btree (cnpj)`.

#### UserUnit — `user_units`

Associação entre usuário e unidade, com papel e situação local.

Fonte: [user-unit.entity.ts](../meatshop-backend/src/units/entities/user-unit.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('user_units_id_seq'::regclass)` |
| `user_id` | `integer` | FK | não | `—` |
| `unit_id` | `integer` | FK | não | `—` |
| `local_role` | `user_units_local_role_enum` | — | não | `—` |
| `status` | `user_units_status_enum` | — | não | `'ACTIVE'::user_units_status_enum` |
| `created_at` | `timestamp` | — | não | `now()` |

Restrições e índices:

- `FK_user_units_unit_id`: `FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE`.
- `FK_user_units_user_id`: `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`.
- `PK_user_units`: `PRIMARY KEY (id)`.
- `user_units_created_at_not_null`: `NOT NULL created_at`.
- `user_units_id_not_null`: `NOT NULL id`.
- `user_units_local_role_not_null`: `NOT NULL local_role`.
- `user_units_status_not_null`: `NOT NULL status`.
- `user_units_unit_id_not_null`: `NOT NULL unit_id`.
- `user_units_user_id_not_null`: `NOT NULL user_id`.
- `IDX_user_units_user_id_unit_id`: `CREATE UNIQUE INDEX "IDX_user_units_user_id_unit_id" ON public.user_units USING btree (user_id, unit_id)`.
- `IDX_user_units_user_status`: `CREATE INDEX "IDX_user_units_user_status" ON public.user_units USING btree (user_id, status)`.
- `PK_user_units`: `CREATE UNIQUE INDEX "PK_user_units" ON public.user_units USING btree (id)`.

#### BusinessHours — `business_hours`

Horários de funcionamento por unidade e dia da semana.

Fonte: [business-hours.entity.ts](../meatshop-backend/src/units/entities/business-hours.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('business_hours_id_seq'::regclass)` |
| `unit_id` | `integer` | FK | não | `—` |
| `weekday` | `business_hours_weekday_enum` | — | não | `—` |
| `opening_time` | `time` | — | sim | `—` |
| `closing_time` | `time` | — | sim | `—` |
| `is_open` | `boolean` | — | não | `true` |

Restrições e índices:

- `FK_business_hours_unit_id`: `FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE`.
- `PK_business_hours`: `PRIMARY KEY (id)`.
- `business_hours_id_not_null`: `NOT NULL id`.
- `business_hours_is_open_not_null`: `NOT NULL is_open`.
- `business_hours_unit_id_not_null`: `NOT NULL unit_id`.
- `business_hours_weekday_not_null`: `NOT NULL weekday`.
- `PK_business_hours`: `CREATE UNIQUE INDEX "PK_business_hours" ON public.business_hours USING btree (id)`.
- `UQ_business_hours_unit_id_weekday`: `CREATE UNIQUE INDEX "UQ_business_hours_unit_id_weekday" ON public.business_hours USING btree (unit_id, weekday)`.

### Catálogo e compras

#### Category — `categories`

Categorias de produtos por unidade.

Fonte: [category.entity.ts](../meatshop-backend/src/categories/entities/category.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('categories_id_seq'::regclass)` |
| `name` | `varchar(100)` | — | não | `—` |
| `description` | `varchar(255)` | — | sim | `—` |
| `active` | `boolean` | — | não | `true` |
| `unit_id` | `integer` | FK | não | `—` |

Restrições e índices:

- `FK_categories_unit_id`: `FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE`.
- `PK_categories`: `PRIMARY KEY (id)`.
- `categories_active_not_null`: `NOT NULL active`.
- `categories_id_not_null`: `NOT NULL id`.
- `categories_name_not_null`: `NOT NULL name`.
- `categories_unit_id_not_null`: `NOT NULL unit_id`.
- `PK_categories`: `CREATE UNIQUE INDEX "PK_categories" ON public.categories USING btree (id)`.

#### Product — `products`

Catálogo e preços de produtos da unidade.

Fonte: [product.entity.ts](../meatshop-backend/src/products/entities/product.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('products_id_seq'::regclass)` |
| `name` | `varchar(150)` | — | não | `—` |
| `description` | `text` | — | sim | `—` |
| `price` | `numeric(10,2)` | — | não | `—` |
| `unit_of_measure` | `varchar(50)` | — | não | `—` |
| `active` | `boolean` | — | não | `true` |
| `unit_id` | `integer` | FK | não | `—` |
| `category_id` | `integer` | FK | não | `—` |
| `brand` | `varchar(100)` | — | sim | `—` |
| `image_url` | `varchar` | — | sim | `—` |

Restrições e índices:

- `FK_products_category_id`: `FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT`.
- `FK_products_unit_id`: `FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE`.
- `PK_products`: `PRIMARY KEY (id)`.
- `products_active_not_null`: `NOT NULL active`.
- `products_category_id_not_null`: `NOT NULL category_id`.
- `products_id_not_null`: `NOT NULL id`.
- `products_name_not_null`: `NOT NULL name`.
- `products_price_not_null`: `NOT NULL price`.
- `products_unit_id_not_null`: `NOT NULL unit_id`.
- `products_unit_of_measure_not_null`: `NOT NULL unit_of_measure`.
- `PK_products`: `CREATE UNIQUE INDEX "PK_products" ON public.products USING btree (id)`.

#### ProductImage — `product_images`

Imagens adicionais de produtos.

Fonte: [product-image.entity.ts](../meatshop-backend/src/products/entities/product-image.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('product_images_id_seq'::regclass)` |
| `product_id` | `integer` | FK | não | `—` |
| `image_url` | `varchar` | — | não | `—` |
| `created_at` | `timestamp` | — | não | `now()` |

Restrições e índices:

- `FK_4f166bb8c2bfcef2498d97b4068`: `FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE`.
- `PK_1974264ea7265989af8392f63a1`: `PRIMARY KEY (id)`.
- `product_images_created_at_not_null`: `NOT NULL created_at`.
- `product_images_id_not_null`: `NOT NULL id`.
- `product_images_image_url_not_null`: `NOT NULL image_url`.
- `product_images_product_id_not_null`: `NOT NULL product_id`.
- `PK_1974264ea7265989af8392f63a1`: `CREATE UNIQUE INDEX "PK_1974264ea7265989af8392f63a1" ON public.product_images USING btree (id)`.

#### Stock — `stock`

Saldo e quantidade mínima de estoque por produto.

Fonte: [stock.entity.ts](../meatshop-backend/src/products/entities/stock.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('stock_id_seq'::regclass)` |
| `product_id` | `integer` | FK, UK | não | `—` |
| `quantity` | `numeric(12,3)` | — | não | `0` |
| `updated_at` | `timestamp` | — | não | `now()` |
| `min_quantity` | `numeric(12,3)` | — | não | `0` |

Restrições e índices:

- `FK_stock_product_id`: `FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE`.
- `PK_stock`: `PRIMARY KEY (id)`.
- `UQ_stock_product_id`: `UNIQUE (product_id)`.
- `stock_id_not_null`: `NOT NULL id`.
- `stock_min_quantity_not_null`: `NOT NULL min_quantity`.
- `stock_product_id_not_null`: `NOT NULL product_id`.
- `stock_quantity_not_null`: `NOT NULL quantity`.
- `stock_updated_at_not_null`: `NOT NULL updated_at`.
- `PK_stock`: `CREATE UNIQUE INDEX "PK_stock" ON public.stock USING btree (id)`.
- `UQ_stock_product_id`: `CREATE UNIQUE INDEX "UQ_stock_product_id" ON public.stock USING btree (product_id)`.

#### Cart — `cart`

Carrinho de compras de um usuário.

Fonte: [cart.entity.ts](../meatshop-backend/src/cart/entities/cart.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('cart_id_seq'::regclass)` |
| `user_id` | `integer` | FK, UK | não | `—` |
| `created_at` | `timestamp` | — | não | `now()` |

Restrições e índices:

- `FK_cart_user_id`: `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`.
- `PK_cart`: `PRIMARY KEY (id)`.
- `UQ_cart_user_id`: `UNIQUE (user_id)`.
- `cart_created_at_not_null`: `NOT NULL created_at`.
- `cart_id_not_null`: `NOT NULL id`.
- `cart_user_id_not_null`: `NOT NULL user_id`.
- `PK_cart`: `CREATE UNIQUE INDEX "PK_cart" ON public.cart USING btree (id)`.
- `UQ_cart_user_id`: `CREATE UNIQUE INDEX "UQ_cart_user_id" ON public.cart USING btree (user_id)`.

#### CartItem — `cart_items`

Produtos, quantidades e preços do carrinho.

Fonte: [cart-item.entity.ts](../meatshop-backend/src/cart/entities/cart-item.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('cart_items_id_seq'::regclass)` |
| `cart_id` | `integer` | FK | não | `—` |
| `product_id` | `integer` | FK | não | `—` |
| `quantity` | `numeric(12,3)` | — | não | `—` |
| `unit_price` | `numeric(10,2)` | — | não | `—` |

Restrições e índices:

- `FK_cart_items_cart_id`: `FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE`.
- `FK_cart_items_product_id`: `FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE`.
- `PK_cart_items`: `PRIMARY KEY (id)`.
- `cart_items_cart_id_not_null`: `NOT NULL cart_id`.
- `cart_items_id_not_null`: `NOT NULL id`.
- `cart_items_product_id_not_null`: `NOT NULL product_id`.
- `cart_items_quantity_not_null`: `NOT NULL quantity`.
- `cart_items_unit_price_not_null`: `NOT NULL unit_price`.
- `IDX_cart_items_cart_id_product_id`: `CREATE UNIQUE INDEX "IDX_cart_items_cart_id_product_id" ON public.cart_items USING btree (cart_id, product_id)`.
- `PK_cart_items`: `CREATE UNIQUE INDEX "PK_cart_items" ON public.cart_items USING btree (id)`.

#### Promotion — `promotions`

Promoções de produtos, unidade e usuário criador.

Fonte: [promotion.entity.ts](../meatshop-backend/src/promotions/entities/promotion.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('promotions_id_seq'::regclass)` |
| `unit_id` | `integer` | FK | não | `—` |
| `product_id` | `integer` | FK | não | `—` |
| `title` | `varchar(150)` | — | não | `—` |
| `description` | `text` | — | sim | `—` |
| `discount_percentage` | `numeric(5,2)` | — | sim | `—` |
| `promotional_price` | `numeric(10,2)` | — | sim | `—` |
| `starts_at` | `timestamp` | — | não | `—` |
| `ends_at` | `timestamp` | — | não | `—` |
| `active` | `boolean` | — | não | `true` |
| `created_at` | `timestamp` | — | não | `now()` |
| `created_by` | `integer` | FK | não | `—` |
| `notification_sent_at` | `timestamptz` | — | sim | `—` |

Restrições e índices:

- `FK_promotions_created_by`: `FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT`.
- `FK_promotions_product_id`: `FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE`.
- `FK_promotions_unit_id`: `FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE`.
- `PK_promotions`: `PRIMARY KEY (id)`.
- `promotions_active_not_null`: `NOT NULL active`.
- `promotions_created_at_not_null`: `NOT NULL created_at`.
- `promotions_created_by_not_null`: `NOT NULL created_by`.
- `promotions_ends_at_not_null`: `NOT NULL ends_at`.
- `promotions_id_not_null`: `NOT NULL id`.
- `promotions_product_id_not_null`: `NOT NULL product_id`.
- `promotions_starts_at_not_null`: `NOT NULL starts_at`.
- `promotions_title_not_null`: `NOT NULL title`.
- `promotions_unit_id_not_null`: `NOT NULL unit_id`.
- `IDX_promotions_active_product_period`: `CREATE INDEX "IDX_promotions_active_product_period" ON public.promotions USING btree (product_id, starts_at, ends_at) WHERE (active = true)`.
- `PK_promotions`: `CREATE UNIQUE INDEX "PK_promotions" ON public.promotions USING btree (id)`.

#### Coupon — `coupons`

Definição, escopo, regras e limites dos cupons.

Fonte: [coupon.entity.ts](../meatshop-backend/src/promotions/entities/coupon.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('coupons_id_seq'::regclass)` |
| `code` | `varchar(50)` | UK | não | `—` |
| `expires_at` | `timestamp` | — | não | `—` |
| `active` | `boolean` | — | não | `true` |
| `created_at` | `timestamp` | — | não | `now()` |
| `name` | `varchar(120)` | — | não | `—` |
| `description` | `text` | — | sim | `—` |
| `type` | `coupons_type_enum` | — | não | `'PLATFORM'::coupons_type_enum` |
| `unit_id` | `integer` | FK | sim | `—` |
| `discount_type` | `coupons_discount_type_enum` | — | não | `—` |
| `discount_amount` | `numeric(10,2)` | — | não | `—` |
| `maximum_discount` | `numeric(10,2)` | — | sim | `—` |
| `minimum_order_value` | `numeric(10,2)` | — | não | `0` |
| `starts_at` | `timestamp` | — | não | `now()` |
| `total_usage_limit` | `integer` | — | sim | `—` |
| `usage_limit_per_user` | `integer` | — | sim | `—` |
| `current_usage_count` | `integer` | — | não | `0` |
| `created_by` | `integer` | FK | não | `—` |
| `updated_at` | `timestamp` | — | não | `now()` |

Restrições e índices:

- `FK_coupons_creator`: `FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT`.
- `FK_coupons_unit`: `FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE`.
- `PK_coupons`: `PRIMARY KEY (id)`.
- `UQ_coupons_code`: `UNIQUE (code)`.
- `coupons_active_not_null`: `NOT NULL active`.
- `coupons_code_not_null`: `NOT NULL code`.
- `coupons_created_at_not_null`: `NOT NULL created_at`.
- `coupons_created_by_not_null`: `NOT NULL created_by`.
- `coupons_current_usage_count_not_null`: `NOT NULL current_usage_count`.
- `coupons_discount_amount_not_null`: `NOT NULL discount_amount`.
- `coupons_discount_type_not_null`: `NOT NULL discount_type`.
- `coupons_expires_at_not_null`: `NOT NULL expires_at`.
- `coupons_id_not_null`: `NOT NULL id`.
- `coupons_minimum_order_value_not_null`: `NOT NULL minimum_order_value`.
- `coupons_name_not_null`: `NOT NULL name`.
- `coupons_starts_at_not_null`: `NOT NULL starts_at`.
- `coupons_type_not_null`: `NOT NULL type`.
- `coupons_updated_at_not_null`: `NOT NULL updated_at`.
- `IDX_coupons_scope_active`: `CREATE INDEX "IDX_coupons_scope_active" ON public.coupons USING btree (type, unit_id, active)`.
- `PK_coupons`: `CREATE UNIQUE INDEX "PK_coupons" ON public.coupons USING btree (id)`.
- `UQ_coupons_code`: `CREATE UNIQUE INDEX "UQ_coupons_code" ON public.coupons USING btree (code)`.

#### CouponUnit — `coupon_units`

Associação de cupons às unidades permitidas.

Fonte: [coupon-unit.entity.ts](../meatshop-backend/src/promotions/entities/coupon-unit.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `coupon_id` | `integer` | PK, FK | não | `—` |
| `unit_id` | `integer` | PK, FK | não | `—` |

Restrições e índices:

- `FK_coupon_units_coupon`: `FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE`.
- `FK_coupon_units_unit`: `FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE`.
- `PK_coupon_units`: `PRIMARY KEY (coupon_id, unit_id)`.
- `coupon_units_coupon_id_not_null`: `NOT NULL coupon_id`.
- `coupon_units_unit_id_not_null`: `NOT NULL unit_id`.
- `PK_coupon_units`: `CREATE UNIQUE INDEX "PK_coupon_units" ON public.coupon_units USING btree (coupon_id, unit_id)`.

#### CouponRedemption — `coupon_redemptions`

Uso do cupom em pedido, usuário e unidade.

Fonte: [coupon-redemption.entity.ts](../meatshop-backend/src/promotions/entities/coupon-redemption.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('coupon_redemptions_id_seq'::regclass)` |
| `coupon_id` | `integer` | FK | não | `—` |
| `user_id` | `integer` | FK | não | `—` |
| `order_id` | `integer` | FK, UK | não | `—` |
| `unit_id` | `integer` | FK | não | `—` |
| `discount_amount` | `numeric(10,2)` | — | não | `—` |
| `status` | `coupon_redemptions_status_enum` | — | não | `'REDEEMED'::coupon_redemptions_status_enum` |
| `redeemed_at` | `timestamp` | — | não | `now()` |
| `released_at` | `timestamp` | — | sim | `—` |

Restrições e índices:

- `FK_redemption_coupon`: `FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE RESTRICT`.
- `FK_redemption_order`: `FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT`.
- `FK_redemption_unit`: `FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE RESTRICT`.
- `FK_redemption_user`: `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT`.
- `PK_coupon_redemptions`: `PRIMARY KEY (id)`.
- `UQ_coupon_redemptions_order`: `UNIQUE (order_id)`.
- `coupon_redemptions_coupon_id_not_null`: `NOT NULL coupon_id`.
- `coupon_redemptions_discount_amount_not_null`: `NOT NULL discount_amount`.
- `coupon_redemptions_id_not_null`: `NOT NULL id`.
- `coupon_redemptions_order_id_not_null`: `NOT NULL order_id`.
- `coupon_redemptions_redeemed_at_not_null`: `NOT NULL redeemed_at`.
- `coupon_redemptions_status_not_null`: `NOT NULL status`.
- `coupon_redemptions_unit_id_not_null`: `NOT NULL unit_id`.
- `coupon_redemptions_user_id_not_null`: `NOT NULL user_id`.
- `IDX_coupon_redemptions_usage`: `CREATE INDEX "IDX_coupon_redemptions_usage" ON public.coupon_redemptions USING btree (coupon_id, user_id, status)`.
- `PK_coupon_redemptions`: `CREATE UNIQUE INDEX "PK_coupon_redemptions" ON public.coupon_redemptions USING btree (id)`.
- `UQ_coupon_redemptions_order`: `CREATE UNIQUE INDEX "UQ_coupon_redemptions_order" ON public.coupon_redemptions USING btree (order_id)`.

#### Sale — `sales`

Cadastro legado de campanhas com imagem e desconto; sem FK para pedidos ou unidades.

Fonte: [sale.entity.ts](../meatshop-backend/src/finance/entities/sale.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('sales_id_seq'::regclass)` |
| `name` | `varchar(150)` | — | não | `—` |
| `image_url` | `varchar(500)` | — | não | `—` |
| `discountValue` | `numeric(10,2)` | — | não | `'0'::numeric` |
| `active` | `boolean` | — | não | `true` |
| `starts_at` | `timestamp` | — | sim | `—` |
| `ends_at` | `timestamp` | — | sim | `—` |
| `created_at` | `timestamp` | — | não | `now()` |
| `updated_at` | `timestamp` | — | não | `now()` |

Restrições e índices:

- `PK_4f0bc990ae81dba46da680895ea`: `PRIMARY KEY (id)`.
- `sales_active_not_null`: `NOT NULL active`.
- `sales_created_at_not_null`: `NOT NULL created_at`.
- `sales_discountValue_not_null`: `NOT NULL "discountValue"`.
- `sales_id_not_null`: `NOT NULL id`.
- `sales_image_url_not_null`: `NOT NULL image_url`.
- `sales_name_not_null`: `NOT NULL name`.
- `sales_updated_at_not_null`: `NOT NULL updated_at`.
- `PK_4f0bc990ae81dba46da680895ea`: `CREATE UNIQUE INDEX "PK_4f0bc990ae81dba46da680895ea" ON public.sales USING btree (id)`.

### Pedidos e avaliações

#### Order — `orders`

Pedidos, valores, entrega, agendamento e dados de rastreamento.

Fonte: [order.entity.ts](../meatshop-backend/src/orders/entities/order.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('orders_id_seq'::regclass)` |
| `client_id` | `integer` | FK | não | `—` |
| `unit_id` | `integer` | FK | não | `—` |
| `delivery_person_id` | `integer` | FK | sim | `—` |
| `order_date` | `timestamp` | — | não | `now()` |
| `status` | `orders_status_enum` | — | não | `'PENDING'::orders_status_enum` |
| `delivery_status` | `orders_delivery_status_enum` | — | sim | `—` |
| `delivery_step` | `orders_delivery_step_enum` | — | sim | `—` |
| `total_amount` | `numeric(10,2)` | — | não | `—` |
| `subtotal` | `numeric(10,2)` | — | não | `—` |
| `discount_amount` | `numeric(10,2)` | — | não | `0` |
| `delivery_fee` | `numeric(10,2)` | — | não | `0` |
| `cancellation_reason` | `text` | — | sim | `—` |
| `cancelled_at` | `timestamp` | — | sim | `—` |
| `cancelled_by` | `orders_cancelled_by_enum` | — | sim | `—` |
| `address_id` | `integer` | FK | sim | `—` |
| `coupon_id` | `integer` | FK | sim | `—` |
| `scheduled_delivery_date` | `timestamp` | — | sim | `—` |
| `is_scheduled` | `boolean` | — | não | `false` |
| `delivery_type` | `orders_delivery_type_enum` | — | não | `'DELIVERY'::orders_delivery_type_enum` |
| `payment_status` | `orders_payment_status_enum` | — | não | `'PENDING'::orders_payment_status_enum` |
| `updated_at` | `timestamp` | — | não | `now()` |
| `pickup_code_hash` | `varchar(64)` | — | sim | `—` |
| `delivery_code_hash` | `varchar(64)` | — | sim | `—` |
| `pickup_code_expires_at` | `timestamp` | — | sim | `—` |
| `delivery_code_expires_at` | `timestamp` | — | sim | `—` |
| `pickup_code_attempts` | `integer` | — | não | `0` |
| `delivery_code_attempts` | `integer` | — | não | `0` |
| `pickup_code_locked_until` | `timestamp` | — | sim | `—` |
| `delivery_code_locked_until` | `timestamp` | — | sim | `—` |
| `pickup_verified_at` | `timestamp` | — | sim | `—` |
| `delivery_verified_at` | `timestamp` | — | sim | `—` |
| `checkout_id` | `uuid` | — | sim | `—` |
| `delivery_code_ciphertext` | `varchar(255)` | — | sim | `—` |
| `destination_snapshot` | `jsonb` | — | sim | `—` |
| `tracking_session_id` | `uuid` | — | sim | `—` |
| `tracking_consent_user_id` | `integer` | — | sim | `—` |
| `tracking_consent_at` | `timestamptz` | — | sim | `—` |
| `tracking_revoked_at` | `timestamptz` | — | sim | `—` |
| `payment_due_at` | `timestamptz` | — | sim | `—` |
| `change_for` | `numeric(12,2)` | — | sim | `—` |
| `checkout_request_hash` | `varchar(64)` | — | sim | `—` |

Restrições e índices:

- `FK_orders_address_id`: `FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE RESTRICT`.
- `FK_orders_client_id`: `FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE RESTRICT`.
- `FK_orders_coupon_id`: `FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL`.
- `FK_orders_delivery_person_id`: `FOREIGN KEY (delivery_person_id) REFERENCES delivery_persons(id) ON DELETE SET NULL`.
- `FK_orders_unit_id`: `FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE RESTRICT`.
- `PK_orders`: `PRIMARY KEY (id)`.
- `orders_client_id_not_null`: `NOT NULL client_id`.
- `orders_delivery_code_attempts_not_null`: `NOT NULL delivery_code_attempts`.
- `orders_delivery_fee_not_null`: `NOT NULL delivery_fee`.
- `orders_delivery_type_not_null`: `NOT NULL delivery_type`.
- `orders_discount_amount_not_null`: `NOT NULL discount_amount`.
- `orders_id_not_null`: `NOT NULL id`.
- `orders_is_scheduled_not_null`: `NOT NULL is_scheduled`.
- `orders_order_date_not_null`: `NOT NULL order_date`.
- `orders_payment_consistent`: `TRIGGER DEFERRABLE INITIALLY DEFERRED`.
- `orders_payment_status_not_null`: `NOT NULL payment_status`.
- `orders_pickup_code_attempts_not_null`: `NOT NULL pickup_code_attempts`.
- `orders_status_not_null`: `NOT NULL status`.
- `orders_subtotal_not_null`: `NOT NULL subtotal`.
- `orders_total_amount_not_null`: `NOT NULL total_amount`.
- `orders_unit_id_not_null`: `NOT NULL unit_id`.
- `orders_updated_at_not_null`: `NOT NULL updated_at`.
- `IDX_orders_client_checkout_unit`: `CREATE UNIQUE INDEX "IDX_orders_client_checkout_unit" ON public.orders USING btree (client_id, checkout_id, unit_id) WHERE (checkout_id IS NOT NULL)`.
- `IDX_orders_schedule_capacity`: `CREATE INDEX "IDX_orders_schedule_capacity" ON public.orders USING btree (unit_id, scheduled_delivery_date) WHERE ((is_scheduled = true) AND (status <> 'CANCELLED'::orders_status_enum))`.
- `PK_orders`: `CREATE UNIQUE INDEX "PK_orders" ON public.orders USING btree (id)`.
- `payment_order_client_date`: `CREATE INDEX payment_order_client_date ON public.orders USING btree (client_id, order_date, id)`.
- `payment_order_due`: `CREATE INDEX payment_order_due ON public.orders USING btree (payment_due_at) WHERE (status = 'PENDING'::orders_status_enum)`.
- `payment_order_unit_date`: `CREATE INDEX payment_order_unit_date ON public.orders USING btree (unit_id, order_date, id)`.

#### OrderItem — `order_items`

Itens do pedido e snapshot do produto.

Fonte: [order-item.entity.ts](../meatshop-backend/src/orders/entities/order-item.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('order_items_id_seq'::regclass)` |
| `order_id` | `integer` | FK | não | `—` |
| `product_id` | `integer` | FK | não | `—` |
| `quantity` | `numeric(12,3)` | — | não | `—` |
| `unit_price` | `numeric(10,2)` | — | não | `—` |
| `product_snapshot` | `jsonb` | — | sim | `—` |

Restrições e índices:

- `FK_order_items_order_id`: `FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE`.
- `FK_order_items_product_id`: `FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT`.
- `PK_order_items`: `PRIMARY KEY (id)`.
- `order_items_id_not_null`: `NOT NULL id`.
- `order_items_order_id_not_null`: `NOT NULL order_id`.
- `order_items_product_id_not_null`: `NOT NULL product_id`.
- `order_items_quantity_not_null`: `NOT NULL quantity`.
- `order_items_unit_price_not_null`: `NOT NULL unit_price`.
- `PK_order_items`: `CREATE UNIQUE INDEX "PK_order_items" ON public.order_items USING btree (id)`.

#### OrderStatusHistory — `order_status_history`

Histórico de estados e usuário responsável pela alteração.

Fonte: [order-status-history.entity.ts](../meatshop-backend/src/orders/entities/order-status-history.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('order_status_history_id_seq'::regclass)` |
| `order_id` | `integer` | FK | não | `—` |
| `updated_by` | `integer` | FK | sim | `—` |
| `status` | `order_status_history_status_enum` | — | não | `—` |
| `created_at` | `timestamp` | — | não | `now()` |

Restrições e índices:

- `FK_order_status_history_order_id`: `FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE`.
- `FK_order_status_history_updated_by`: `FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL`.
- `PK_order_status_history`: `PRIMARY KEY (id)`.
- `order_status_history_created_at_not_null`: `NOT NULL created_at`.
- `order_status_history_id_not_null`: `NOT NULL id`.
- `order_status_history_order_id_not_null`: `NOT NULL order_id`.
- `order_status_history_status_not_null`: `NOT NULL status`.
- `PK_order_status_history`: `CREATE UNIQUE INDEX "PK_order_status_history" ON public.order_status_history USING btree (id)`.

#### Payment — `payments`

Pagamento associado ao pedido e informações de conciliação e recebimento.

Fonte: [payment.entity.ts](../meatshop-backend/src/orders/entities/payment.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('payments_id_seq'::regclass)` |
| `order_id` | `integer` | FK, UK | não | `—` |
| `method` | `payments_method_enum` | — | sim | `—` |
| `status` | `payments_status_enum` | — | não | `'PENDING'::payments_status_enum` |
| `payment_date` | `timestamptz` | — | sim | `—` |
| `transaction_id` | `varchar(40)` | — | sim | `—` |
| `mp_preference_id` | `varchar(120)` | — | sim | `—` |
| `mp_status_detail` | `varchar(60)` | — | sim | `—` |
| `mp_last_event_at` | `timestamp` | — | sim | `—` |
| `created_at` | `timestamp` | — | não | `now()` |
| `updated_at` | `timestamp` | — | não | `now()` |
| `mp_checkout_url` | `varchar(500)` | — | sim | `—` |
| `refunded_amount` | `numeric(12,2)` | — | não | `0` |
| `fee_amount` | `numeric(12,2)` | — | não | `0` |
| `refund_status` | `varchar(30)` | — | sim | `—` |
| `reconcile_after` | `timestamptz` | — | não | `now()` |
| `received_by` | `integer` | — | sim | `—` |
| `receipt_reference` | `varchar(200)` | — | sim | `—` |
| `payment_reference` | `varchar(100)` | — | sim | `—` |

Restrições e índices:

- `FK_payments_order_id`: `FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE`.
- `PK_payments`: `PRIMARY KEY (id)`.
- `UQ_payments_order_id`: `UNIQUE (order_id)`.
- `payment_amounts_nonnegative`: `CHECK (((refunded_amount >= (0)::numeric) AND (fee_amount >= (0)::numeric)))`.
- `payments_created_at_not_null`: `NOT NULL created_at`.
- `payments_fee_amount_not_null`: `NOT NULL fee_amount`.
- `payments_id_not_null`: `NOT NULL id`.
- `payments_order_consistent`: `TRIGGER DEFERRABLE INITIALLY DEFERRED`.
- `payments_order_id_not_null`: `NOT NULL order_id`.
- `payments_reconcile_after_not_null`: `NOT NULL reconcile_after`.
- `payments_refunded_amount_not_null`: `NOT NULL refunded_amount`.
- `payments_status_not_null`: `NOT NULL status`.
- `payments_updated_at_not_null`: `NOT NULL updated_at`.
- `PK_payments`: `CREATE UNIQUE INDEX "PK_payments" ON public.payments USING btree (id)`.
- `UQ_payments_order_id`: `CREATE UNIQUE INDEX "UQ_payments_order_id" ON public.payments USING btree (order_id)`.
- `payment_receipt_date`: `CREATE INDEX payment_receipt_date ON public.payments USING btree (payment_date, order_id)`.
- `payment_reconcile_due`: `CREATE INDEX payment_reconcile_due ON public.payments USING btree (reconcile_after, order_id)`.
- `payment_transaction_owner`: `CREATE UNIQUE INDEX payment_transaction_owner ON public.payments USING btree (transaction_id) WHERE (transaction_id IS NOT NULL)`.

#### Review — `reviews`

Avaliações de unidade e, opcionalmente, produto no contexto do pedido.

Fonte: [review.entity.ts](../meatshop-backend/src/reviews/entities/review.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('reviews_id_seq'::regclass)` |
| `order_id` | `integer` | FK | não | `—` |
| `client_id` | `integer` | FK | não | `—` |
| `unit_id` | `integer` | FK | não | `—` |
| `product_id` | `integer` | FK | sim | `—` |
| `rating` | `integer` | — | não | `—` |
| `comment` | `text` | — | sim | `—` |
| `created_at` | `timestamp` | — | não | `now()` |

Restrições e índices:

- `CHK_reviews_rating`: `CHECK (((rating >= 1) AND (rating <= 5)))`.
- `FK_reviews_client_id`: `FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE`.
- `FK_reviews_order_id`: `FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE`.
- `FK_reviews_product_id`: `FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE`.
- `FK_reviews_unit_id`: `FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE`.
- `PK_reviews`: `PRIMARY KEY (id)`.
- `reviews_client_id_not_null`: `NOT NULL client_id`.
- `reviews_created_at_not_null`: `NOT NULL created_at`.
- `reviews_id_not_null`: `NOT NULL id`.
- `reviews_order_id_not_null`: `NOT NULL order_id`.
- `reviews_rating_not_null`: `NOT NULL rating`.
- `reviews_unit_id_not_null`: `NOT NULL unit_id`.
- `PK_reviews`: `CREATE UNIQUE INDEX "PK_reviews" ON public.reviews USING btree (id)`.
- `UQ_reviews_order_product`: `CREATE UNIQUE INDEX "UQ_reviews_order_product" ON public.reviews USING btree (order_id, product_id) WHERE (product_id IS NOT NULL)`.
- `UQ_reviews_order_unit_only`: `CREATE UNIQUE INDEX "UQ_reviews_order_unit_only" ON public.reviews USING btree (order_id) WHERE (product_id IS NULL)`.

#### DeliveryReview — `delivery_reviews`

Avaliação do entregador por pedido.

Fonte: [delivery-review.entity.ts](../meatshop-backend/src/reviews/entities/delivery-review.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('delivery_reviews_id_seq'::regclass)` |
| `order_id` | `integer` | FK, UK | não | `—` |
| `client_id` | `integer` | FK | não | `—` |
| `delivery_person_id` | `integer` | FK | não | `—` |
| `rating` | `integer` | — | não | `—` |
| `comment` | `text` | — | sim | `—` |
| `created_at` | `timestamp` | — | não | `now()` |

Restrições e índices:

- `CHK_delivery_reviews_rating`: `CHECK (((rating >= 1) AND (rating <= 5)))`.
- `FK_delivery_reviews_client_id`: `FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE`.
- `FK_delivery_reviews_delivery_person_id`: `FOREIGN KEY (delivery_person_id) REFERENCES delivery_persons(id) ON DELETE CASCADE`.
- `FK_delivery_reviews_order_id`: `FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE`.
- `PK_delivery_reviews`: `PRIMARY KEY (id)`.
- `UQ_delivery_reviews_order_id`: `UNIQUE (order_id)`.
- `delivery_reviews_client_id_not_null`: `NOT NULL client_id`.
- `delivery_reviews_created_at_not_null`: `NOT NULL created_at`.
- `delivery_reviews_delivery_person_id_not_null`: `NOT NULL delivery_person_id`.
- `delivery_reviews_id_not_null`: `NOT NULL id`.
- `delivery_reviews_order_id_not_null`: `NOT NULL order_id`.
- `delivery_reviews_rating_not_null`: `NOT NULL rating`.
- `PK_delivery_reviews`: `CREATE UNIQUE INDEX "PK_delivery_reviews" ON public.delivery_reviews USING btree (id)`.
- `UQ_delivery_reviews_order_id`: `CREATE UNIQUE INDEX "UQ_delivery_reviews_order_id" ON public.delivery_reviews USING btree (order_id)`.

#### Chat — `chat_messages`

Mensagens entre participantes de um pedido.

Fonte: [chat.entity.ts](../meatshop-backend/src/chat/entities/chat.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('chat_messages_id_seq'::regclass)` |
| `order_id` | `integer` | FK | não | `—` |
| `sender_id` | `integer` | FK | não | `—` |
| `receiver_id` | `integer` | FK | não | `—` |
| `participant_type` | `chat_messages_participant_type_enum` | — | não | `—` |
| `message` | `text` | — | não | `—` |
| `sent_at` | `timestamp` | — | não | `now()` |
| `read_at` | `timestamp` | — | sim | `—` |

Restrições e índices:

- `FK_chat_messages_order_id`: `FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE`.
- `FK_chat_messages_receiver_id`: `FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE RESTRICT`.
- `FK_chat_messages_sender_id`: `FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE RESTRICT`.
- `PK_chat_messages`: `PRIMARY KEY (id)`.
- `chat_messages_id_not_null`: `NOT NULL id`.
- `chat_messages_message_not_null`: `NOT NULL message`.
- `chat_messages_order_id_not_null`: `NOT NULL order_id`.
- `chat_messages_participant_type_not_null`: `NOT NULL participant_type`.
- `chat_messages_receiver_id_not_null`: `NOT NULL receiver_id`.
- `chat_messages_sender_id_not_null`: `NOT NULL sender_id`.
- `chat_messages_sent_at_not_null`: `NOT NULL sent_at`.
- `IDX_chat_messages_order_participant`: `CREATE INDEX "IDX_chat_messages_order_participant" ON public.chat_messages USING btree (order_id, participant_type)`.
- `PK_chat_messages`: `CREATE UNIQUE INDEX "PK_chat_messages" ON public.chat_messages USING btree (id)`.
- `idx_chat_messages_unread`: `CREATE INDEX idx_chat_messages_unread ON public.chat_messages USING btree (order_id, participant_type, receiver_id, read_at)`.

### Entregadores e financeiro

#### DeliveryPerson — `delivery_persons`

Perfil do entregador, vínculo, disponibilidade e avaliação.

Fonte: [delivery-person.entity.ts](../meatshop-backend/src/delivery/entities/delivery-person.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('delivery_persons_id_seq'::regclass)` |
| `user_id` | `integer` | FK, UK | não | `—` |
| `vehicle` | `delivery_persons_vehicle_enum` | — | não | `—` |
| `status` | `delivery_persons_status_enum` | — | não | `'PENDING'::delivery_persons_status_enum` |
| `average_rating` | `numeric(3,2)` | — | sim | `—` |
| `created_at` | `timestamp` | — | não | `now()` |
| `is_online` | `boolean` | — | não | `false` |
| `availability_updated_at` | `timestamp` | — | sim | `—` |
| `affiliation_type` | `delivery_persons_affiliation_type_enum` | — | não | `'AUTONOMOUS'::delivery_persons_affiliation_type_enum` |

Restrições e índices:

- `FK_delivery_persons_user_id`: `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`.
- `PK_delivery_persons`: `PRIMARY KEY (id)`.
- `UQ_delivery_persons_user_id`: `UNIQUE (user_id)`.
- `delivery_persons_affiliation_type_not_null`: `NOT NULL affiliation_type`.
- `delivery_persons_created_at_not_null`: `NOT NULL created_at`.
- `delivery_persons_id_not_null`: `NOT NULL id`.
- `delivery_persons_is_online_not_null`: `NOT NULL is_online`.
- `delivery_persons_status_not_null`: `NOT NULL status`.
- `delivery_persons_user_id_not_null`: `NOT NULL user_id`.
- `delivery_persons_vehicle_not_null`: `NOT NULL vehicle`.
- `PK_delivery_persons`: `CREATE UNIQUE INDEX "PK_delivery_persons" ON public.delivery_persons USING btree (id)`.
- `UQ_delivery_persons_user_id`: `CREATE UNIQUE INDEX "UQ_delivery_persons_user_id" ON public.delivery_persons USING btree (user_id)`.

#### Vehicle — `vehicles`

Veículos do entregador, incluindo flags de ativação.

Fonte: [vehicle.entity.ts](../meatshop-backend/src/delivery/entities/vehicle.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('vehicles_id_seq'::regclass)` |
| `delivery_person_id` | `integer` | FK | não | `—` |
| `type` | `vehicles_type_enum` | — | não | `—` |
| `model` | `varchar(80)` | — | não | `—` |
| `plate` | `varchar(10)` | — | não | `—` |
| `color` | `varchar(30)` | — | não | `—` |
| `year` | `smallint` | — | não | `—` |
| `is_active` | `boolean` | — | não | `false` |
| `created_at` | `timestamp` | — | não | `now()` |
| `is_enabled` | `boolean` | — | não | `true` |
| `photo_urls` | `jsonb` | — | não | `'[]'::jsonb` |

Restrições e índices:

- `FK_vehicles_delivery_person_id`: `FOREIGN KEY (delivery_person_id) REFERENCES delivery_persons(id) ON DELETE CASCADE`.
- `PK_vehicles`: `PRIMARY KEY (id)`.
- `vehicles_color_not_null`: `NOT NULL color`.
- `vehicles_created_at_not_null`: `NOT NULL created_at`.
- `vehicles_delivery_person_id_not_null`: `NOT NULL delivery_person_id`.
- `vehicles_id_not_null`: `NOT NULL id`.
- `vehicles_is_active_not_null`: `NOT NULL is_active`.
- `vehicles_is_enabled_not_null`: `NOT NULL is_enabled`.
- `vehicles_model_not_null`: `NOT NULL model`.
- `vehicles_photo_urls_not_null`: `NOT NULL photo_urls`.
- `vehicles_plate_not_null`: `NOT NULL plate`.
- `vehicles_type_not_null`: `NOT NULL type`.
- `vehicles_year_not_null`: `NOT NULL year`.
- `PK_vehicles`: `CREATE UNIQUE INDEX "PK_vehicles" ON public.vehicles USING btree (id)`.
- `UQ_vehicles_active_per_person`: `CREATE UNIQUE INDEX "UQ_vehicles_active_per_person" ON public.vehicles USING btree (delivery_person_id) WHERE (is_active = true)`.

#### DeliveryTracking — `delivery_tracking`

Amostras de localização de uma entrega.

Fonte: [delivery-tracking.entity.ts](../meatshop-backend/src/delivery/entities/delivery-tracking.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('delivery_tracking_id_seq'::regclass)` |
| `order_id` | `integer` | FK | não | `—` |
| `latitude` | `numeric(10,7)` | — | não | `—` |
| `longitude` | `numeric(10,7)` | — | não | `—` |
| `created_at` | `timestamp` | — | não | `now()` |
| `accuracy` | `numeric(7,2)` | — | sim | `—` |
| `delivery_person_id` | `integer` | — | sim | `—` |
| `sample_id` | `uuid` | — | sim | `—` |
| `captured_at` | `timestamptz` | — | sim | `—` |

Restrições e índices:

- `FK_delivery_tracking_order_id`: `FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE`.
- `PK_delivery_tracking`: `PRIMARY KEY (id)`.
- `delivery_tracking_created_at_not_null`: `NOT NULL created_at`.
- `delivery_tracking_id_not_null`: `NOT NULL id`.
- `delivery_tracking_latitude_not_null`: `NOT NULL latitude`.
- `delivery_tracking_longitude_not_null`: `NOT NULL longitude`.
- `delivery_tracking_order_id_not_null`: `NOT NULL order_id`.
- `IDX_delivery_tracking_order_created`: `CREATE INDEX "IDX_delivery_tracking_order_created" ON public.delivery_tracking USING btree (order_id, created_at DESC)`.
- `PK_delivery_tracking`: `CREATE UNIQUE INDEX "PK_delivery_tracking" ON public.delivery_tracking USING btree (id)`.
- `idx_tracking_retention`: `CREATE INDEX idx_tracking_retention ON public.delivery_tracking USING btree (created_at)`.
- `idx_tracking_sample`: `CREATE UNIQUE INDEX idx_tracking_sample ON public.delivery_tracking USING btree (order_id, sample_id) WHERE (sample_id IS NOT NULL)`.

#### DeliveryGoal — `delivery_goals`

Metas do entregador por período.

Fonte: [delivery-goal.entity.ts](../meatshop-backend/src/delivery/entities/delivery-goal.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('delivery_goals_id_seq'::regclass)` |
| `delivery_person_id` | `integer` | FK | não | `—` |
| `period` | `delivery_goals_period_enum` | — | não | `—` |
| `target` | `numeric(10,2)` | — | não | `—` |
| `updated_at` | `timestamp` | — | não | `now()` |

Restrições e índices:

- `FK_delivery_goal_person`: `FOREIGN KEY (delivery_person_id) REFERENCES delivery_persons(id) ON DELETE CASCADE`.
- `PK_delivery_goals`: `PRIMARY KEY (id)`.
- `UQ_delivery_goal_period`: `UNIQUE (delivery_person_id, period)`.
- `delivery_goals_delivery_person_id_not_null`: `NOT NULL delivery_person_id`.
- `delivery_goals_id_not_null`: `NOT NULL id`.
- `delivery_goals_period_not_null`: `NOT NULL period`.
- `delivery_goals_target_not_null`: `NOT NULL target`.
- `delivery_goals_updated_at_not_null`: `NOT NULL updated_at`.
- `PK_delivery_goals`: `CREATE UNIQUE INDEX "PK_delivery_goals" ON public.delivery_goals USING btree (id)`.
- `UQ_delivery_goal_period`: `CREATE UNIQUE INDEX "UQ_delivery_goal_period" ON public.delivery_goals USING btree (delivery_person_id, period)`.

#### DeliveryOfferRejection — `delivery_offer_rejections`

Recusas de ofertas de entrega e motivos.

Fonte: [delivery-offer-rejection.entity.ts](../meatshop-backend/src/delivery/entities/delivery-offer-rejection.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('delivery_offer_rejections_id_seq'::regclass)` |
| `delivery_person_id` | `integer` | FK | não | `—` |
| `order_id` | `integer` | FK | não | `—` |
| `reasons` | `jsonb` | — | não | `'[]'::jsonb` |
| `created_at` | `timestamp` | — | não | `now()` |

Restrições e índices:

- `FK_delivery_offer_rejection_order`: `FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE`.
- `FK_delivery_offer_rejection_person`: `FOREIGN KEY (delivery_person_id) REFERENCES delivery_persons(id) ON DELETE CASCADE`.
- `PK_delivery_offer_rejections`: `PRIMARY KEY (id)`.
- `UQ_delivery_offer_rejection`: `UNIQUE (delivery_person_id, order_id)`.
- `delivery_offer_rejections_created_at_not_null`: `NOT NULL created_at`.
- `delivery_offer_rejections_delivery_person_id_not_null`: `NOT NULL delivery_person_id`.
- `delivery_offer_rejections_id_not_null`: `NOT NULL id`.
- `delivery_offer_rejections_order_id_not_null`: `NOT NULL order_id`.
- `delivery_offer_rejections_reasons_not_null`: `NOT NULL reasons`.
- `PK_delivery_offer_rejections`: `CREATE UNIQUE INDEX "PK_delivery_offer_rejections" ON public.delivery_offer_rejections USING btree (id)`.
- `UQ_delivery_offer_rejection`: `CREATE UNIQUE INDEX "UQ_delivery_offer_rejection" ON public.delivery_offer_rejections USING btree (delivery_person_id, order_id)`.

#### DeliveryExpenses — `delivery_expenses`

Despesas pessoais do entregador, vinculadas à conta de usuário.

Fonte: [1792790400000-CompleteFunctionalGaps.ts](../meatshop-backend/src/database/migrations/1792790400000-CompleteFunctionalGaps.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('delivery_expenses_id_seq'::regclass)` |
| `user_id` | `integer` | FK | não | `—` |
| `category` | `varchar(30)` | — | não | `—` |
| `description` | `varchar(300)` | — | não | `—` |
| `amount` | `numeric(12,2)` | — | não | `—` |
| `incurred_on` | `date` | — | não | `—` |
| `created_at` | `timestamptz` | — | não | `now()` |
| `updated_at` | `timestamptz` | — | não | `now()` |

Restrições e índices:

- `delivery_expenses_amount_check`: `CHECK (((amount > (0)::numeric) AND (amount <= 9999999999.99)))`.
- `delivery_expenses_amount_not_null`: `NOT NULL amount`.
- `delivery_expenses_category_check`: `CHECK (((category)::text = ANY ((ARRAY['FUEL'::character varying, 'MAINTENANCE'::character varying, 'PARKING'::character varying, 'TOLL'::character varying, 'INSURANCE'::character varying, 'OTHER'::character varying])::text[])))`.
- `delivery_expenses_category_not_null`: `NOT NULL category`.
- `delivery_expenses_created_at_not_null`: `NOT NULL created_at`.
- `delivery_expenses_description_check`: `CHECK ((length(TRIM(BOTH FROM description)) > 0))`.
- `delivery_expenses_description_not_null`: `NOT NULL description`.
- `delivery_expenses_id_not_null`: `NOT NULL id`.
- `delivery_expenses_incurred_on_not_null`: `NOT NULL incurred_on`.
- `delivery_expenses_pkey`: `PRIMARY KEY (id)`.
- `delivery_expenses_updated_at_not_null`: `NOT NULL updated_at`.
- `delivery_expenses_user_id_fkey`: `FOREIGN KEY (user_id) REFERENCES users(id)`.
- `delivery_expenses_user_id_not_null`: `NOT NULL user_id`.
- `delivery_expenses_pkey`: `CREATE UNIQUE INDEX delivery_expenses_pkey ON public.delivery_expenses USING btree (id)`.
- `idx_delivery_expenses_user_date`: `CREATE INDEX idx_delivery_expenses_user_date ON public.delivery_expenses USING btree (user_id, incurred_on DESC, id DESC)`.

#### DeliverySettlements — `delivery_settlements`

Acerto recebido pelo entregador, com responsável pelo registro.

Fonte: [1790550001000-PaymentReceipts.ts](../meatshop-backend/src/database/migrations/1790550001000-PaymentReceipts.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `order_id` | `integer` | PK, FK | não | `—` |
| `delivery_person_id` | `integer` | FK | não | `—` |
| `actor_id` | `integer` | FK | não | `—` |
| `amount` | `numeric(12,2)` | — | não | `—` |
| `reference` | `varchar(200)` | — | não | `—` |
| `paid_at` | `timestamptz` | — | não | `now()` |

Restrições e índices:

- `delivery_settlement_reference_valid`: `CHECK ((length(btrim((reference)::text)) >= 3))`.
- `delivery_settlements_actor_id_fkey`: `FOREIGN KEY (actor_id) REFERENCES users(id)`.
- `delivery_settlements_actor_id_not_null`: `NOT NULL actor_id`.
- `delivery_settlements_amount_not_null`: `NOT NULL amount`.
- `delivery_settlements_delivery_person_id_fkey`: `FOREIGN KEY (delivery_person_id) REFERENCES delivery_persons(id)`.
- `delivery_settlements_delivery_person_id_not_null`: `NOT NULL delivery_person_id`.
- `delivery_settlements_order_id_fkey`: `FOREIGN KEY (order_id) REFERENCES orders(id)`.
- `delivery_settlements_order_id_not_null`: `NOT NULL order_id`.
- `delivery_settlements_paid_at_not_null`: `NOT NULL paid_at`.
- `delivery_settlements_pkey`: `PRIMARY KEY (order_id)`.
- `delivery_settlements_reference_not_null`: `NOT NULL reference`.
- `settlement_amount_positive`: `CHECK ((amount > (0)::numeric))`.
- `delivery_settlements_pkey`: `CREATE UNIQUE INDEX delivery_settlements_pkey ON public.delivery_settlements USING btree (order_id)`.

#### DeliveryEarningsEvents — `delivery_earnings_events`

Fila de eventos de ganhos gerados por triggers; IDs sem FKs declaradas.

Fonte: [1793300002000-DeliveryEarningsEvents.ts](../meatshop-backend/src/database/migrations/1793300002000-DeliveryEarningsEvents.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `bigint` | PK | não | `nextval('delivery_earnings_events_id_seq'::regclass)` |
| `order_id` | `integer` | — | não | `—` |
| `user_id` | `integer` | — | não | `—` |
| `created_at` | `timestamptz` | — | não | `now()` |

Restrições e índices:

- `delivery_earnings_events_created_at_not_null`: `NOT NULL created_at`.
- `delivery_earnings_events_id_not_null`: `NOT NULL id`.
- `delivery_earnings_events_order_id_not_null`: `NOT NULL order_id`.
- `delivery_earnings_events_pkey`: `PRIMARY KEY (id)`.
- `delivery_earnings_events_user_id_not_null`: `NOT NULL user_id`.
- `delivery_earnings_events_pkey`: `CREATE UNIQUE INDEX delivery_earnings_events_pkey ON public.delivery_earnings_events USING btree (id)`.

#### Expense — `expenses`

Despesas administrativas da unidade e dados de pagamento e fornecedor.

Fonte: [expense.entity.ts](../meatshop-backend/src/finance/entities/expense.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('expenses_id_seq'::regclass)` |
| `supplierName` | `varchar` | — | não | `—` |
| `type` | `text` | — | não | `—` |
| `amount` | `numeric(10,2)` | — | não | `—` |
| `discount` | `numeric(10,2)` | — | não | `'0'::numeric` |
| `paidAmount` | `numeric(10,2)` | — | não | `'0'::numeric` |
| `postedAt` | `text` | — | sim | `—` |
| `paidAt` | `text` | — | sim | `—` |
| `paymentMethod` | `text` | — | não | `—` |
| `notes` | `text` | — | sim | `—` |
| `cpfCnpj` | `text` | — | sim | `—` |
| `supplierId` | `text` | — | sim | `—` |
| `createdAt` | `timestamp` | — | não | `now()` |
| `updatedAt` | `timestamp` | — | não | `now()` |
| `unit_id` | `integer` | FK | não | `—` |

Restrições e índices:

- `FK_expenses_unit_id`: `FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE RESTRICT`.
- `PK_94c3ceb17e3140abc9282c20610`: `PRIMARY KEY (id)`.
- `expenses_amount_not_null`: `NOT NULL amount`.
- `expenses_createdAt_not_null`: `NOT NULL "createdAt"`.
- `expenses_discount_not_null`: `NOT NULL discount`.
- `expenses_id_not_null`: `NOT NULL id`.
- `expenses_paidAmount_not_null`: `NOT NULL "paidAmount"`.
- `expenses_paymentMethod_not_null`: `NOT NULL "paymentMethod"`.
- `expenses_supplierName_not_null`: `NOT NULL "supplierName"`.
- `expenses_type_not_null`: `NOT NULL type`.
- `expenses_unit_id_not_null`: `NOT NULL unit_id`.
- `expenses_updatedAt_not_null`: `NOT NULL "updatedAt"`.
- `IDX_d56aee4d1775f4caeba629dece`: `CREATE INDEX "IDX_d56aee4d1775f4caeba629dece" ON public.expenses USING btree ("paidAt")`.
- `PK_94c3ceb17e3140abc9282c20610`: `CREATE UNIQUE INDEX "PK_94c3ceb17e3140abc9282c20610" ON public.expenses USING btree (id)`.

### Operações de pagamentos

#### PaymentSellers — `payment_sellers`

Credenciais OAuth e situação da conta recebedora por unidade.

Fonte: [1790550000000-HardenPayments.ts](../meatshop-backend/src/database/migrations/1790550000000-HardenPayments.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `unit_id` | `integer` | PK, FK | não | `—` |
| `collector_id` | `varchar(80)` | — | não | `—` |
| `access_token` | `text` | — | não | `—` |
| `refresh_token` | `text` | — | não | `—` |
| `expires_at` | `timestamptz` | — | não | `—` |
| `enabled` | `boolean` | — | não | `true` |
| `last_error` | `varchar(255)` | — | sim | `—` |
| `updated_at` | `timestamptz` | — | não | `now()` |

Restrições e índices:

- `payment_sellers_access_token_not_null`: `NOT NULL access_token`.
- `payment_sellers_collector_id_not_null`: `NOT NULL collector_id`.
- `payment_sellers_enabled_not_null`: `NOT NULL enabled`.
- `payment_sellers_expires_at_not_null`: `NOT NULL expires_at`.
- `payment_sellers_pkey`: `PRIMARY KEY (unit_id)`.
- `payment_sellers_refresh_token_not_null`: `NOT NULL refresh_token`.
- `payment_sellers_unit_id_fkey`: `FOREIGN KEY (unit_id) REFERENCES units(id)`.
- `payment_sellers_unit_id_not_null`: `NOT NULL unit_id`.
- `payment_sellers_updated_at_not_null`: `NOT NULL updated_at`.
- `payment_sellers_pkey`: `CREATE UNIQUE INDEX payment_sellers_pkey ON public.payment_sellers USING btree (unit_id)`.

#### PaymentOauthStates — `payment_oauth_states`

Estados temporários da autorização OAuth de pagamentos.

Fonte: [1790550000000-HardenPayments.ts](../meatshop-backend/src/database/migrations/1790550000000-HardenPayments.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `state_hash` | `varchar(64)` | PK | não | `—` |
| `unit_id` | `integer` | FK | não | `—` |
| `user_id` | `integer` | FK | não | `—` |
| `verifier` | `text` | — | não | `—` |
| `expires_at` | `timestamptz` | — | não | `—` |

Restrições e índices:

- `payment_oauth_states_expires_at_not_null`: `NOT NULL expires_at`.
- `payment_oauth_states_pkey`: `PRIMARY KEY (state_hash)`.
- `payment_oauth_states_state_hash_not_null`: `NOT NULL state_hash`.
- `payment_oauth_states_unit_id_fkey`: `FOREIGN KEY (unit_id) REFERENCES units(id)`.
- `payment_oauth_states_unit_id_not_null`: `NOT NULL unit_id`.
- `payment_oauth_states_user_id_fkey`: `FOREIGN KEY (user_id) REFERENCES users(id)`.
- `payment_oauth_states_user_id_not_null`: `NOT NULL user_id`.
- `payment_oauth_states_verifier_not_null`: `NOT NULL verifier`.
- `payment_oauth_states_pkey`: `CREATE UNIQUE INDEX payment_oauth_states_pkey ON public.payment_oauth_states USING btree (state_hash)`.

#### PaymentTransactions — `payment_transactions`

Transações externas e valores conciliados por unidade.

Fonte: [1790550000000-HardenPayments.ts](../meatshop-backend/src/database/migrations/1790550000000-HardenPayments.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `varchar(80)` | PK | não | `—` |
| `unit_id` | `integer` | FK | não | `—` |
| `reference` | `varchar(100)` | — | não | `—` |
| `status` | `varchar(30)` | — | não | `—` |
| `amount` | `numeric(12,2)` | — | não | `—` |
| `refunded_amount` | `numeric(12,2)` | — | não | `0` |
| `provider_updated_at` | `timestamptz` | — | sim | `—` |
| `updated_at` | `timestamptz` | — | não | `now()` |

Restrições e índices:

- `payment_transactions_amount_not_null`: `NOT NULL amount`.
- `payment_transactions_id_not_null`: `NOT NULL id`.
- `payment_transactions_pkey`: `PRIMARY KEY (id)`.
- `payment_transactions_reference_not_null`: `NOT NULL reference`.
- `payment_transactions_refunded_amount_not_null`: `NOT NULL refunded_amount`.
- `payment_transactions_status_not_null`: `NOT NULL status`.
- `payment_transactions_unit_id_fkey`: `FOREIGN KEY (unit_id) REFERENCES units(id)`.
- `payment_transactions_unit_id_not_null`: `NOT NULL unit_id`.
- `payment_transactions_updated_at_not_null`: `NOT NULL updated_at`.
- `transaction_amounts_valid`: `CHECK (((amount > (0)::numeric) AND (refunded_amount >= (0)::numeric) AND (refunded_amount <= amount)))`.
- `payment_transactions_pkey`: `CREATE UNIQUE INDEX payment_transactions_pkey ON public.payment_transactions USING btree (id)`.
- `payment_transactions_reference_idx`: `CREATE INDEX payment_transactions_reference_idx ON public.payment_transactions USING btree (reference)`.
- `payment_transactions_unit_reference`: `CREATE INDEX payment_transactions_unit_reference ON public.payment_transactions USING btree (unit_id, reference)`.

#### PaymentRefunds — `payment_refunds`

Solicitações de reembolso e controle de retentativas.

Fonte: [1790550000000-HardenPayments.ts](../meatshop-backend/src/database/migrations/1790550000000-HardenPayments.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `uuid` | PK | não | `—` |
| `payment_id` | `varchar(80)` | — | não | `—` |
| `unit_id` | `integer` | FK | não | `—` |
| `order_id` | `integer` | FK | sim | `—` |
| `amount` | `numeric(12,2)` | — | não | `—` |
| `status` | `varchar(30)` | — | não | `'PENDING'::character varying` |
| `reason` | `varchar(255)` | — | não | `—` |
| `requested_by` | `integer` | — | sim | `—` |
| `provider_id` | `varchar(80)` | — | sim | `—` |
| `attempts` | `integer` | — | não | `0` |
| `next_attempt_at` | `timestamptz` | — | não | `now()` |
| `last_error` | `varchar(255)` | — | sim | `—` |
| `created_at` | `timestamptz` | — | não | `now()` |
| `updated_at` | `timestamptz` | — | não | `now()` |
| `attempt_key` | `uuid` | UK | não | `—` |
| `retry_requested_by` | `integer` | FK | sim | `—` |

Restrições e índices:

- `payment_refund_state_valid`: `CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'FAILED'::character varying, 'COMPLETED'::character varying])::text[])))`.
- `payment_refunds_amount_check`: `CHECK ((amount > (0)::numeric))`.
- `payment_refunds_amount_not_null`: `NOT NULL amount`.
- `payment_refunds_attempt_key_not_null`: `NOT NULL attempt_key`.
- `payment_refunds_attempts_not_null`: `NOT NULL attempts`.
- `payment_refunds_created_at_not_null`: `NOT NULL created_at`.
- `payment_refunds_id_not_null`: `NOT NULL id`.
- `payment_refunds_next_attempt_at_not_null`: `NOT NULL next_attempt_at`.
- `payment_refunds_order_id_fkey`: `FOREIGN KEY (order_id) REFERENCES orders(id)`.
- `payment_refunds_payment_id_not_null`: `NOT NULL payment_id`.
- `payment_refunds_payment_id_order_id_key`: `UNIQUE (payment_id, order_id)`.
- `payment_refunds_pkey`: `PRIMARY KEY (id)`.
- `payment_refunds_reason_not_null`: `NOT NULL reason`.
- `payment_refunds_retry_requested_by_fkey`: `FOREIGN KEY (retry_requested_by) REFERENCES users(id)`.
- `payment_refunds_status_not_null`: `NOT NULL status`.
- `payment_refunds_unit_id_fkey`: `FOREIGN KEY (unit_id) REFERENCES units(id)`.
- `payment_refunds_unit_id_not_null`: `NOT NULL unit_id`.
- `payment_refunds_updated_at_not_null`: `NOT NULL updated_at`.
- `payment_duplicate_refund`: `CREATE UNIQUE INDEX payment_duplicate_refund ON public.payment_refunds USING btree (payment_id) WHERE (order_id IS NULL)`.
- `payment_refund_attempt_identity`: `CREATE UNIQUE INDEX payment_refund_attempt_identity ON public.payment_refunds USING btree (attempt_key)`.
- `payment_refund_pending`: `CREATE INDEX payment_refund_pending ON public.payment_refunds USING btree (next_attempt_at) WHERE ((status)::text = 'PENDING'::text)`.
- `payment_refunds_order`: `CREATE INDEX payment_refunds_order ON public.payment_refunds USING btree (order_id, created_at)`.
- `payment_refunds_payment_id_order_id_key`: `CREATE UNIQUE INDEX payment_refunds_payment_id_order_id_key ON public.payment_refunds USING btree (payment_id, order_id)`.
- `payment_refunds_pkey`: `CREATE UNIQUE INDEX payment_refunds_pkey ON public.payment_refunds USING btree (id)`.

#### PaymentRefundAttempts — `payment_refund_attempts`

Histórico de tentativas de reembolso.

Fonte: [1791900000000-PaymentOperations.ts](../meatshop-backend/src/database/migrations/1791900000000-PaymentOperations.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `bigint` | PK | não | `nextval('payment_refund_attempts_id_seq'::regclass)` |
| `refund_id` | `uuid` | FK | não | `—` |
| `attempt_key` | `uuid` | — | não | `—` |
| `provider_id` | `varchar(80)` | — | sim | `—` |
| `status` | `varchar(30)` | — | não | `—` |
| `actor_id` | `integer` | FK | sim | `—` |
| `created_at` | `timestamptz` | — | não | `now()` |

Restrições e índices:

- `payment_refund_attempts_actor_id_fkey`: `FOREIGN KEY (actor_id) REFERENCES users(id)`.
- `payment_refund_attempts_attempt_key_not_null`: `NOT NULL attempt_key`.
- `payment_refund_attempts_created_at_not_null`: `NOT NULL created_at`.
- `payment_refund_attempts_id_not_null`: `NOT NULL id`.
- `payment_refund_attempts_pkey`: `PRIMARY KEY (id)`.
- `payment_refund_attempts_refund_id_fkey`: `FOREIGN KEY (refund_id) REFERENCES payment_refunds(id)`.
- `payment_refund_attempts_refund_id_not_null`: `NOT NULL refund_id`.
- `payment_refund_attempts_status_not_null`: `NOT NULL status`.
- `payment_refund_attempts_pkey`: `CREATE UNIQUE INDEX payment_refund_attempts_pkey ON public.payment_refund_attempts USING btree (id)`.

#### PaymentManualEvents — `payment_manual_events`

Registros manuais de recebimento vinculados ao pedido e operador.

Fonte: [1790550001000-PaymentReceipts.ts](../meatshop-backend/src/database/migrations/1790550001000-PaymentReceipts.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `uuid` | PK | não | `—` |
| `order_id` | `integer` | FK | não | `—` |
| `actor_id` | `integer` | FK | não | `—` |
| `kind` | `varchar(30)` | — | não | `—` |
| `amount` | `numeric(12,2)` | — | não | `—` |
| `reference` | `varchar(200)` | — | não | `—` |
| `created_at` | `timestamptz` | — | não | `now()` |

Restrições e índices:

- `manual_amount_positive`: `CHECK ((amount > (0)::numeric))`.
- `payment_manual_events_actor_id_fkey`: `FOREIGN KEY (actor_id) REFERENCES users(id)`.
- `payment_manual_events_actor_id_not_null`: `NOT NULL actor_id`.
- `payment_manual_events_amount_not_null`: `NOT NULL amount`.
- `payment_manual_events_created_at_not_null`: `NOT NULL created_at`.
- `payment_manual_events_id_not_null`: `NOT NULL id`.
- `payment_manual_events_kind_not_null`: `NOT NULL kind`.
- `payment_manual_events_order_id_fkey`: `FOREIGN KEY (order_id) REFERENCES orders(id)`.
- `payment_manual_events_order_id_kind_key`: `UNIQUE (order_id, kind)`.
- `payment_manual_events_order_id_not_null`: `NOT NULL order_id`.
- `payment_manual_events_pkey`: `PRIMARY KEY (id)`.
- `payment_manual_events_reference_not_null`: `NOT NULL reference`.
- `payment_manual_reference_valid`: `CHECK ((length(btrim((reference)::text)) >= 3))`.
- `payment_manual_events_order_id_kind_key`: `CREATE UNIQUE INDEX payment_manual_events_order_id_kind_key ON public.payment_manual_events USING btree (order_id, kind)`.
- `payment_manual_events_pkey`: `CREATE UNIQUE INDEX payment_manual_events_pkey ON public.payment_manual_events USING btree (id)`.
- `payment_manual_order`: `CREATE INDEX payment_manual_order ON public.payment_manual_events USING btree (order_id, created_at)`.

#### PaymentNotifications — `payment_notifications`

Fila de notificações de estado de pagamento.

Fonte: [1790550001000-PaymentReceipts.ts](../meatshop-backend/src/database/migrations/1790550001000-PaymentReceipts.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('payment_notifications_id_seq'::regclass)` |
| `order_id` | `integer` | FK | não | `—` |
| `status` | `varchar(30)` | — | não | `—` |
| `sent_at` | `timestamptz` | — | sim | `—` |
| `next_attempt_at` | `timestamptz` | — | não | `now()` |
| `created_at` | `timestamptz` | — | não | `now()` |

Restrições e índices:

- `payment_notifications_created_at_not_null`: `NOT NULL created_at`.
- `payment_notifications_id_not_null`: `NOT NULL id`.
- `payment_notifications_next_attempt_at_not_null`: `NOT NULL next_attempt_at`.
- `payment_notifications_order_id_fkey`: `FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE`.
- `payment_notifications_order_id_not_null`: `NOT NULL order_id`.
- `payment_notifications_order_id_status_key`: `UNIQUE (order_id, status)`.
- `payment_notifications_pkey`: `PRIMARY KEY (id)`.
- `payment_notifications_status_not_null`: `NOT NULL status`.
- `payment_notification_due`: `CREATE INDEX payment_notification_due ON public.payment_notifications USING btree (next_attempt_at, id) WHERE (sent_at IS NULL)`.
- `payment_notifications_order_id_status_key`: `CREATE UNIQUE INDEX payment_notifications_order_id_status_key ON public.payment_notifications USING btree (order_id, status)`.
- `payment_notifications_pkey`: `CREATE UNIQUE INDEX payment_notifications_pkey ON public.payment_notifications USING btree (id)`.

#### PaymentSellerEvents — `payment_seller_events`

Histórico de operações na conta recebedora da unidade.

Fonte: [1791900000000-PaymentOperations.ts](../meatshop-backend/src/database/migrations/1791900000000-PaymentOperations.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `bigint` | PK | não | `nextval('payment_seller_events_id_seq'::regclass)` |
| `unit_id` | `integer` | FK | não | `—` |
| `actor_id` | `integer` | FK | sim | `—` |
| `kind` | `varchar(30)` | — | não | `—` |
| `collector_id` | `varchar(80)` | — | sim | `—` |
| `created_at` | `timestamptz` | — | não | `now()` |

Restrições e índices:

- `payment_seller_events_actor_id_fkey`: `FOREIGN KEY (actor_id) REFERENCES users(id)`.
- `payment_seller_events_created_at_not_null`: `NOT NULL created_at`.
- `payment_seller_events_id_not_null`: `NOT NULL id`.
- `payment_seller_events_kind_not_null`: `NOT NULL kind`.
- `payment_seller_events_pkey`: `PRIMARY KEY (id)`.
- `payment_seller_events_unit_id_fkey`: `FOREIGN KEY (unit_id) REFERENCES units(id)`.
- `payment_seller_events_unit_id_not_null`: `NOT NULL unit_id`.
- `payment_seller_events_pkey`: `CREATE UNIQUE INDEX payment_seller_events_pkey ON public.payment_seller_events USING btree (id)`.
- `payment_seller_events_unit`: `CREATE INDEX payment_seller_events_unit ON public.payment_seller_events USING btree (unit_id, created_at)`.

#### PaymentWebhookEvents — `payment_webhook_events`

Fila persistente de webhooks; IDs externos e unidade sem FKs declaradas.

Fonte: [1793100000000-PaymentWebhookQueue.ts](../meatshop-backend/src/database/migrations/1793100000000-PaymentWebhookQueue.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `bigint` | PK | não | `nextval('payment_webhook_events_id_seq'::regclass)` |
| `payment_id` | `varchar(40)` | — | não | `—` |
| `unit_id` | `integer` | — | sim | `—` |
| `collector_id` | `varchar(40)` | — | sim | `—` |
| `dedupe_key` | `varchar(120)` | — | não | `—` |
| `status` | `varchar(12)` | — | não | `'PENDING'::character varying` |
| `attempts` | `integer` | — | não | `0` |
| `next_attempt_at` | `timestamptz` | — | não | `now()` |
| `last_error` | `varchar(255)` | — | sim | `—` |
| `processed_at` | `timestamptz` | — | sim | `—` |
| `created_at` | `timestamptz` | — | não | `now()` |
| `updated_at` | `timestamptz` | — | não | `now()` |

Restrições e índices:

- `chk_payment_webhook_events_seller`: `CHECK (((unit_id IS NOT NULL) OR (collector_id IS NOT NULL)))`.
- `payment_webhook_events_attempts_check`: `CHECK ((attempts >= 0))`.
- `payment_webhook_events_attempts_not_null`: `NOT NULL attempts`.
- `payment_webhook_events_created_at_not_null`: `NOT NULL created_at`.
- `payment_webhook_events_dedupe_key_not_null`: `NOT NULL dedupe_key`.
- `payment_webhook_events_id_not_null`: `NOT NULL id`.
- `payment_webhook_events_next_attempt_at_not_null`: `NOT NULL next_attempt_at`.
- `payment_webhook_events_payment_id_not_null`: `NOT NULL payment_id`.
- `payment_webhook_events_pkey`: `PRIMARY KEY (id)`.
- `payment_webhook_events_status_check`: `CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'PROCESSING'::character varying, 'PROCESSED'::character varying, 'FAILED'::character varying])::text[])))`.
- `payment_webhook_events_status_not_null`: `NOT NULL status`.
- `payment_webhook_events_updated_at_not_null`: `NOT NULL updated_at`.
- `idx_payment_webhook_events_dedupe`: `CREATE INDEX idx_payment_webhook_events_dedupe ON public.payment_webhook_events USING btree (dedupe_key) WHERE ((status)::text = 'PENDING'::text)`.
- `idx_payment_webhook_events_due`: `CREATE INDEX idx_payment_webhook_events_due ON public.payment_webhook_events USING btree (next_attempt_at, id) WHERE ((status)::text = ANY ((ARRAY['PENDING'::character varying, 'PROCESSING'::character varying])::text[]))`.
- `idx_payment_webhook_events_retention`: `CREATE INDEX idx_payment_webhook_events_retention ON public.payment_webhook_events USING btree (processed_at) WHERE ((status)::text = 'PROCESSED'::text)`.
- `payment_webhook_events_pkey`: `CREATE UNIQUE INDEX payment_webhook_events_pkey ON public.payment_webhook_events USING btree (id)`.

### Suporte e notificações

#### SupportTicket — `support_tickets`

Chamados com solicitante, unidade, pedido, responsável e resposta.

Fonte: [support-ticket.entity.ts](../meatshop-backend/src/support/entities/support-ticket.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('support_tickets_id_seq'::regclass)` |
| `user_id` | `integer` | FK | não | `—` |
| `subject` | `varchar(150)` | — | não | `—` |
| `description` | `text` | — | sim | `—` |
| `status` | `support_tickets_status_enum` | — | não | `'OPEN'::support_tickets_status_enum` |
| `response` | `text` | — | sim | `—` |
| `responded_by` | `integer` | FK | sim | `—` |
| `responded_at` | `timestamp` | — | sim | `—` |
| `created_at` | `timestamp` | — | não | `now()` |
| `unit_id` | `integer` | FK | sim | `—` |
| `order_id` | `integer` | FK | sim | `—` |
| `assigned_to` | `integer` | FK | sim | `—` |
| `category` | `support_tickets_category_enum` | — | não | `'OTHER'::support_tickets_category_enum` |
| `priority` | `support_tickets_priority_enum` | — | não | `'NORMAL'::support_tickets_priority_enum` |
| `closed_at` | `timestamp` | — | sim | `—` |
| `last_message_at` | `timestamp` | — | não | `now()` |
| `updated_at` | `timestamp` | — | não | `now()` |
| `contact` | `text` | — | sim | `—` |

Restrições e índices:

- `FK_support_tickets_assignee`: `FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL`.
- `FK_support_tickets_order`: `FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL`.
- `FK_support_tickets_responded_by`: `FOREIGN KEY (responded_by) REFERENCES users(id) ON DELETE SET NULL`.
- `FK_support_tickets_unit`: `FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL`.
- `FK_support_tickets_user_id`: `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`.
- `PK_support_tickets`: `PRIMARY KEY (id)`.
- `support_tickets_category_not_null`: `NOT NULL category`.
- `support_tickets_created_at_not_null`: `NOT NULL created_at`.
- `support_tickets_id_not_null`: `NOT NULL id`.
- `support_tickets_last_message_at_not_null`: `NOT NULL last_message_at`.
- `support_tickets_priority_not_null`: `NOT NULL priority`.
- `support_tickets_status_not_null`: `NOT NULL status`.
- `support_tickets_subject_not_null`: `NOT NULL subject`.
- `support_tickets_updated_at_not_null`: `NOT NULL updated_at`.
- `support_tickets_user_id_not_null`: `NOT NULL user_id`.
- `IDX_support_tickets_queue`: `CREATE INDEX "IDX_support_tickets_queue" ON public.support_tickets USING btree (status, priority, last_message_at)`.
- `PK_support_tickets`: `CREATE UNIQUE INDEX "PK_support_tickets" ON public.support_tickets USING btree (id)`.

#### SupportMessage — `support_messages`

Mensagens do chamado e respectivos remetentes.

Fonte: [support-message.entity.ts](../meatshop-backend/src/support/entities/support-message.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('support_messages_id_seq'::regclass)` |
| `ticket_id` | `integer` | FK | não | `—` |
| `sender_id` | `integer` | FK | não | `—` |
| `message` | `text` | — | sim | `—` |
| `created_at` | `timestamp` | — | não | `now()` |

Restrições e índices:

- `FK_support_messages_sender`: `FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE RESTRICT`.
- `FK_support_messages_ticket`: `FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE`.
- `PK_support_messages`: `PRIMARY KEY (id)`.
- `support_messages_created_at_not_null`: `NOT NULL created_at`.
- `support_messages_id_not_null`: `NOT NULL id`.
- `support_messages_sender_id_not_null`: `NOT NULL sender_id`.
- `support_messages_ticket_id_not_null`: `NOT NULL ticket_id`.
- `IDX_support_messages_ticket_created`: `CREATE INDEX "IDX_support_messages_ticket_created" ON public.support_messages USING btree (ticket_id, created_at)`.
- `PK_support_messages`: `CREATE UNIQUE INDEX "PK_support_messages" ON public.support_messages USING btree (id)`.
- `idx_support_messages_ticket_cursor`: `CREATE INDEX idx_support_messages_ticket_cursor ON public.support_messages USING btree (ticket_id, id DESC)`.

#### SupportAttachment — `support_attachments`

Arquivos anexados às mensagens de suporte.

Fonte: [support-attachment.entity.ts](../meatshop-backend/src/support/entities/support-attachment.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('support_attachments_id_seq'::regclass)` |
| `message_id` | `integer` | FK | não | `—` |
| `file_url` | `varchar(255)` | — | não | `—` |
| `original_name` | `varchar(120)` | — | não | `—` |
| `mime_type` | `varchar(50)` | — | não | `—` |
| `size_bytes` | `integer` | — | não | `—` |
| `created_at` | `timestamp` | — | não | `now()` |

Restrições e índices:

- `FK_support_attachments_message`: `FOREIGN KEY (message_id) REFERENCES support_messages(id) ON DELETE CASCADE`.
- `PK_support_attachments`: `PRIMARY KEY (id)`.
- `support_attachments_created_at_not_null`: `NOT NULL created_at`.
- `support_attachments_file_url_not_null`: `NOT NULL file_url`.
- `support_attachments_id_not_null`: `NOT NULL id`.
- `support_attachments_message_id_not_null`: `NOT NULL message_id`.
- `support_attachments_mime_type_not_null`: `NOT NULL mime_type`.
- `support_attachments_original_name_not_null`: `NOT NULL original_name`.
- `support_attachments_size_bytes_not_null`: `NOT NULL size_bytes`.
- `PK_support_attachments`: `CREATE UNIQUE INDEX "PK_support_attachments" ON public.support_attachments USING btree (id)`.

#### Notification — `notifications`

Notificações do usuário e contexto opcional de unidade.

Fonte: [notification.entity.ts](../meatshop-backend/src/notifications/entities/notification.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('notifications_id_seq'::regclass)` |
| `user_id` | `integer` | FK | não | `—` |
| `message` | `text` | — | não | `—` |
| `type` | `notifications_type_enum` | — | não | `—` |
| `read` | `boolean` | — | não | `false` |
| `created_at` | `timestamp` | — | não | `now()` |
| `unit_id` | `integer` | FK | sim | `—` |
| `title` | `varchar(120)` | — | não | `'MeatShop'::character varying` |
| `action_url` | `varchar(255)` | — | sim | `—` |

Restrições e índices:

- `FK_notifications_unit_id`: `FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE`.
- `FK_notifications_user_id`: `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`.
- `PK_notifications`: `PRIMARY KEY (id)`.
- `notifications_created_at_not_null`: `NOT NULL created_at`.
- `notifications_id_not_null`: `NOT NULL id`.
- `notifications_message_not_null`: `NOT NULL message`.
- `notifications_read_not_null`: `NOT NULL read`.
- `notifications_title_not_null`: `NOT NULL title`.
- `notifications_type_not_null`: `NOT NULL type`.
- `notifications_user_id_not_null`: `NOT NULL user_id`.
- `IDX_notifications_user_unit_created`: `CREATE INDEX "IDX_notifications_user_unit_created" ON public.notifications USING btree (user_id, unit_id, created_at)`.
- `PK_notifications`: `CREATE UNIQUE INDEX "PK_notifications" ON public.notifications USING btree (id)`.

#### NotificationPreference — `notification_preferences`

Preferências de notificação por usuário.

Fonte: [notification-preference.entity.ts](../meatshop-backend/src/notifications/entities/notification-preference.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `user_id` | `integer` | PK, FK | não | `—` |
| `orders_enabled` | `boolean` | — | não | `true` |
| `delivery_enabled` | `boolean` | — | não | `true` |
| `promotions_enabled` | `boolean` | — | não | `true` |
| `system_enabled` | `boolean` | — | não | `true` |
| `updated_at` | `timestamp` | — | não | `now()` |

Restrições e índices:

- `FK_notification_preferences_user_id`: `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`.
- `PK_notification_preferences`: `PRIMARY KEY (user_id)`.
- `notification_preferences_delivery_enabled_not_null`: `NOT NULL delivery_enabled`.
- `notification_preferences_orders_enabled_not_null`: `NOT NULL orders_enabled`.
- `notification_preferences_promotions_enabled_not_null`: `NOT NULL promotions_enabled`.
- `notification_preferences_system_enabled_not_null`: `NOT NULL system_enabled`.
- `notification_preferences_updated_at_not_null`: `NOT NULL updated_at`.
- `notification_preferences_user_id_not_null`: `NOT NULL user_id`.
- `PK_notification_preferences`: `CREATE UNIQUE INDEX "PK_notification_preferences" ON public.notification_preferences USING btree (user_id)`.

#### UserDeviceToken — `user_device_tokens`

Tokens FCM dos dispositivos do usuário.

Fonte: [user-device-token.entity.ts](../meatshop-backend/src/notifications/entities/user-device-token.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('user_device_tokens_id_seq'::regclass)` |
| `user_id` | `integer` | FK | não | `—` |
| `fcm_token` | `varchar(300)` | UK | não | `—` |
| `platform` | `varchar(20)` | — | não | `'WEB'::character varying` |
| `created_at` | `timestamp` | — | não | `now()` |
| `last_seen_at` | `timestamp` | — | não | `now()` |
| `app_version` | `varchar(30)` | — | sim | `—` |

Restrições e índices:

- `FK_user_device_tokens_user_id`: `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`.
- `PK_user_device_tokens`: `PRIMARY KEY (id)`.
- `UQ_user_device_tokens_fcm_token`: `UNIQUE (fcm_token)`.
- `user_device_tokens_created_at_not_null`: `NOT NULL created_at`.
- `user_device_tokens_fcm_token_not_null`: `NOT NULL fcm_token`.
- `user_device_tokens_id_not_null`: `NOT NULL id`.
- `user_device_tokens_last_seen_at_not_null`: `NOT NULL last_seen_at`.
- `user_device_tokens_platform_not_null`: `NOT NULL platform`.
- `user_device_tokens_user_id_not_null`: `NOT NULL user_id`.
- `PK_user_device_tokens`: `CREATE UNIQUE INDEX "PK_user_device_tokens" ON public.user_device_tokens USING btree (id)`.
- `UQ_user_device_tokens_fcm_token`: `CREATE UNIQUE INDEX "UQ_user_device_tokens_fcm_token" ON public.user_device_tokens USING btree (fcm_token)`.

### Receitas

#### Recipe — `recipes`

Receitas publicadas pela unidade.

Fonte: [recipe.entity.ts](../meatshop-backend/src/recipes/entities/recipe.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('recipes_id_seq'::regclass)` |
| `unit_id` | `integer` | FK | não | `—` |
| `title` | `varchar(150)` | — | não | `—` |
| `description` | `text` | — | sim | `—` |
| `image_url` | `varchar` | — | sim | `—` |
| `video_url` | `varchar` | — | sim | `—` |
| `tag` | `varchar(50)` | — | sim | `—` |
| `active` | `boolean` | — | não | `true` |
| `display_order` | `integer` | — | não | `0` |
| `week_start` | `timestamp` | — | sim | `—` |
| `created_at` | `timestamp` | — | não | `now()` |

Restrições e índices:

- `FK_recipes_unit_id`: `FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE`.
- `PK_recipes`: `PRIMARY KEY (id)`.
- `recipes_active_not_null`: `NOT NULL active`.
- `recipes_created_at_not_null`: `NOT NULL created_at`.
- `recipes_display_order_not_null`: `NOT NULL display_order`.
- `recipes_id_not_null`: `NOT NULL id`.
- `recipes_title_not_null`: `NOT NULL title`.
- `recipes_unit_id_not_null`: `NOT NULL unit_id`.
- `PK_recipes`: `CREATE UNIQUE INDEX "PK_recipes" ON public.recipes USING btree (id)`.

#### RecipeStep — `recipe_steps`

Etapas de preparo da receita.

Fonte: [recipe-step.entity.ts](../meatshop-backend/src/recipes/entities/recipe-step.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('recipe_steps_id_seq'::regclass)` |
| `recipe_id` | `integer` | FK | não | `—` |
| `step_number` | `integer` | — | não | `—` |
| `description` | `text` | — | não | `—` |
| `tip` | `text` | — | sim | `—` |

Restrições e índices:

- `FK_recipe_steps_recipe_id`: `FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE`.
- `PK_recipe_steps`: `PRIMARY KEY (id)`.
- `recipe_steps_description_not_null`: `NOT NULL description`.
- `recipe_steps_id_not_null`: `NOT NULL id`.
- `recipe_steps_recipe_id_not_null`: `NOT NULL recipe_id`.
- `recipe_steps_step_number_not_null`: `NOT NULL step_number`.
- `PK_recipe_steps`: `CREATE UNIQUE INDEX "PK_recipe_steps" ON public.recipe_steps USING btree (id)`.
- `UQ_recipe_steps_recipe_id_step_number`: `CREATE UNIQUE INDEX "UQ_recipe_steps_recipe_id_step_number" ON public.recipe_steps USING btree (recipe_id, step_number)`.

#### RecipeIngredient — `recipe_ingredients`

Ingredientes e quantidades da receita.

Fonte: [recipe-ingredient.entity.ts](../meatshop-backend/src/recipes/entities/recipe-ingredient.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('recipe_ingredients_id_seq'::regclass)` |
| `recipe_id` | `integer` | FK | não | `—` |
| `name` | `varchar(150)` | — | não | `—` |
| `quantity` | `varchar(50)` | — | não | `—` |
| `tip` | `varchar` | — | sim | `—` |

Restrições e índices:

- `FK_recipe_ingredients_recipe_id`: `FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE`.
- `PK_recipe_ingredients`: `PRIMARY KEY (id)`.
- `recipe_ingredients_id_not_null`: `NOT NULL id`.
- `recipe_ingredients_name_not_null`: `NOT NULL name`.
- `recipe_ingredients_quantity_not_null`: `NOT NULL quantity`.
- `recipe_ingredients_recipe_id_not_null`: `NOT NULL recipe_id`.
- `PK_recipe_ingredients`: `CREATE UNIQUE INDEX "PK_recipe_ingredients" ON public.recipe_ingredients USING btree (id)`.

#### RecipeProduct — `recipe_products`

Produtos associados à receita e chamadas para compra.

Fonte: [recipe-product.entity.ts](../meatshop-backend/src/recipes/entities/recipe-product.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('recipe_products_id_seq'::regclass)` |
| `recipe_id` | `integer` | FK | não | `—` |
| `product_id` | `integer` | FK | não | `—` |
| `call_to_action` | `varchar(255)` | — | não | `—` |

Restrições e índices:

- `FK_recipe_products_product_id`: `FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE`.
- `FK_recipe_products_recipe_id`: `FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE`.
- `PK_recipe_products`: `PRIMARY KEY (id)`.
- `recipe_products_call_to_action_not_null`: `NOT NULL call_to_action`.
- `recipe_products_id_not_null`: `NOT NULL id`.
- `recipe_products_product_id_not_null`: `NOT NULL product_id`.
- `recipe_products_recipe_id_not_null`: `NOT NULL recipe_id`.
- `PK_recipe_products`: `CREATE UNIQUE INDEX "PK_recipe_products" ON public.recipe_products USING btree (id)`.
- `UQ_recipe_products_recipe_id_product_id`: `CREATE UNIQUE INDEX "UQ_recipe_products_recipe_id_product_id" ON public.recipe_products USING btree (recipe_id, product_id)`.

### IA, documentos e infraestrutura

#### AiConversation — `ai_conversations`

Conversas do assistente com prazo de retenção.

Fonte: [ai-conversation.entity.ts](../meatshop-backend/src/ai/entities/ai-conversation.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `uuid` | PK | não | `gen_random_uuid()` |
| `user_id` | `integer` | FK | não | `—` |
| `created_at` | `timestamptz` | — | não | `now()` |
| `expires_at` | `timestamptz` | — | não | `—` |

Restrições e índices:

- `ai_conversations_created_at_not_null`: `NOT NULL created_at`.
- `ai_conversations_expires_at_not_null`: `NOT NULL expires_at`.
- `ai_conversations_id_not_null`: `NOT NULL id`.
- `ai_conversations_pkey`: `PRIMARY KEY (id)`.
- `ai_conversations_user_id_fkey`: `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`.
- `ai_conversations_user_id_not_null`: `NOT NULL user_id`.
- `ai_conversations_pkey`: `CREATE UNIQUE INDEX ai_conversations_pkey ON public.ai_conversations USING btree (id)`.
- `idx_ai_conversations_retention`: `CREATE INDEX idx_ai_conversations_retention ON public.ai_conversations USING btree (expires_at)`.
- `idx_ai_conversations_user`: `CREATE INDEX idx_ai_conversations_user ON public.ai_conversations USING btree (user_id)`.

#### AiMessage — `ai_messages`

Mensagens das conversas do assistente.

Fonte: [ai-message.entity.ts](../meatshop-backend/src/ai/entities/ai-message.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `bigint` | PK | não | `nextval('ai_messages_id_seq'::regclass)` |
| `conversation_id` | `uuid` | FK | não | `—` |
| `role` | `varchar(10)` | — | não | `—` |
| `content` | `text` | — | não | `—` |
| `created_at` | `timestamptz` | — | não | `now()` |

Restrições e índices:

- `ai_messages_content_not_null`: `NOT NULL content`.
- `ai_messages_conversation_id_fkey`: `FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE`.
- `ai_messages_conversation_id_not_null`: `NOT NULL conversation_id`.
- `ai_messages_created_at_not_null`: `NOT NULL created_at`.
- `ai_messages_id_not_null`: `NOT NULL id`.
- `ai_messages_pkey`: `PRIMARY KEY (id)`.
- `ai_messages_role_check`: `CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'assistant'::character varying])::text[])))`.
- `ai_messages_role_not_null`: `NOT NULL role`.
- `ai_messages_pkey`: `CREATE UNIQUE INDEX ai_messages_pkey ON public.ai_messages USING btree (id)`.
- `idx_ai_messages_history`: `CREATE INDEX idx_ai_messages_history ON public.ai_messages USING btree (conversation_id, created_at)`.

#### AiRateLimit — `ai_rate_limits`

Contador de requisições de IA por usuário.

Fonte: [ai-rate-limit.entity.ts](../meatshop-backend/src/ai/entities/ai-rate-limit.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `user_id` | `integer` | PK, FK | não | `—` |
| `window_started_at` | `timestamptz` | — | não | `now()` |
| `request_count` | `integer` | — | não | `0` |
| `updated_at` | `timestamptz` | — | não | `now()` |

Restrições e índices:

- `ai_rate_limits_pkey`: `PRIMARY KEY (user_id)`.
- `ai_rate_limits_request_count_check`: `CHECK ((request_count >= 0))`.
- `ai_rate_limits_request_count_not_null`: `NOT NULL request_count`.
- `ai_rate_limits_updated_at_not_null`: `NOT NULL updated_at`.
- `ai_rate_limits_user_id_fkey`: `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`.
- `ai_rate_limits_user_id_not_null`: `NOT NULL user_id`.
- `ai_rate_limits_window_started_at_not_null`: `NOT NULL window_started_at`.
- `ai_rate_limits_pkey`: `CREATE UNIQUE INDEX ai_rate_limits_pkey ON public.ai_rate_limits USING btree (user_id)`.

#### LegalDocument — `legal_documents`

Versões de documentos legais e indicação de revogabilidade.

Fonte: [legal-document.entity.ts](../meatshop-backend/src/legal/entities/legal-document.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('legal_documents_id_seq'::regclass)` |
| `kind` | `varchar(40)` | — | não | `—` |
| `version` | `varchar(40)` | — | não | `—` |
| `title` | `varchar(150)` | — | não | `—` |
| `content` | `text` | — | não | `—` |
| `content_hash` | `varchar(64)` | — | não | `—` |
| `published_at` | `timestamptz` | — | não | `—` |
| `is_current` | `boolean` | — | não | `true` |
| `is_revocable` | `boolean` | — | não | `false` |

Restrições e índices:

- `legal_documents_content_hash_not_null`: `NOT NULL content_hash`.
- `legal_documents_content_not_null`: `NOT NULL content`.
- `legal_documents_id_not_null`: `NOT NULL id`.
- `legal_documents_is_current_not_null`: `NOT NULL is_current`.
- `legal_documents_is_revocable_not_null`: `NOT NULL is_revocable`.
- `legal_documents_kind_check`: `CHECK (((kind)::text = ANY ((ARRAY['PLATFORM_TERMS'::character varying, 'PRIVACY_NOTICE'::character varying, 'ESTABLISHMENT_TERMS'::character varying])::text[])))`.
- `legal_documents_kind_not_null`: `NOT NULL kind`.
- `legal_documents_kind_version_key`: `UNIQUE (kind, version)`.
- `legal_documents_pkey`: `PRIMARY KEY (id)`.
- `legal_documents_published_at_not_null`: `NOT NULL published_at`.
- `legal_documents_title_not_null`: `NOT NULL title`.
- `legal_documents_version_not_null`: `NOT NULL version`.
- `idx_legal_current_kind`: `CREATE UNIQUE INDEX idx_legal_current_kind ON public.legal_documents USING btree (kind) WHERE is_current`.
- `legal_documents_kind_version_key`: `CREATE UNIQUE INDEX legal_documents_kind_version_key ON public.legal_documents USING btree (kind, version)`.
- `legal_documents_pkey`: `CREATE UNIQUE INDEX legal_documents_pkey ON public.legal_documents USING btree (id)`.

#### LegalAcceptance — `legal_acceptances`

Eventos de aceite ou revogação, usuário e unidade opcional.

Fonte: [legal-acceptance.entity.ts](../meatshop-backend/src/legal/entities/legal-acceptance.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('legal_acceptances_id_seq'::regclass)` |
| `user_id` | `integer` | FK | não | `—` |
| `document_id` | `integer` | FK | não | `—` |
| `unit_id` | `integer` | FK | sim | `—` |
| `channel` | `varchar(10)` | — | não | `—` |
| `authorized_representative` | `boolean` | — | não | `false` |
| `accepted_at` | `timestamptz` | — | não | `now()` |
| `event_type` | `varchar(10)` | — | não | `'ACCEPTED'::character varying` |

Restrições e índices:

- `legal_acceptances_accepted_at_not_null`: `NOT NULL accepted_at`.
- `legal_acceptances_authorized_representative_not_null`: `NOT NULL authorized_representative`.
- `legal_acceptances_channel_check`: `CHECK (((channel)::text = ANY ((ARRAY['web'::character varying, 'mobile'::character varying])::text[])))`.
- `legal_acceptances_channel_not_null`: `NOT NULL channel`.
- `legal_acceptances_check`: `CHECK (((unit_id IS NULL) OR authorized_representative))`.
- `legal_acceptances_document_id_fkey`: `FOREIGN KEY (document_id) REFERENCES legal_documents(id) ON DELETE RESTRICT`.
- `legal_acceptances_document_id_not_null`: `NOT NULL document_id`.
- `legal_acceptances_event_type_check`: `CHECK (((event_type)::text = ANY ((ARRAY['ACCEPTED'::character varying, 'REVOKED'::character varying])::text[])))`.
- `legal_acceptances_event_type_not_null`: `NOT NULL event_type`.
- `legal_acceptances_id_not_null`: `NOT NULL id`.
- `legal_acceptances_pkey`: `PRIMARY KEY (id)`.
- `legal_acceptances_unit_id_fkey`: `FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE RESTRICT`.
- `legal_acceptances_user_id_fkey`: `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT`.
- `legal_acceptances_user_id_not_null`: `NOT NULL user_id`.
- `idx_legal_effective_acceptance`: `CREATE INDEX idx_legal_effective_acceptance ON public.legal_acceptances USING btree (user_id, document_id, unit_id, id DESC)`.
- `idx_legal_history`: `CREATE INDEX idx_legal_history ON public.legal_acceptances USING btree (user_id, accepted_at DESC)`.
- `idx_legal_unit`: `CREATE INDEX idx_legal_unit ON public.legal_acceptances USING btree (unit_id, document_id)`.
- `legal_acceptances_pkey`: `CREATE UNIQUE INDEX legal_acceptances_pkey ON public.legal_acceptances USING btree (id)`.

#### AuditLog — `audit_logs`

Eventos de auditoria, ator, unidade, resultado e alterações.

Fonte: [audit-log.entity.ts](../meatshop-backend/src/audit/entities/audit-log.entity.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `integer` | PK | não | `nextval('audit_logs_id_seq'::regclass)` |
| `user_id` | `integer` | FK | sim | `—` |
| `action` | `varchar(50)` | — | não | `—` |
| `entity` | `varchar(100)` | — | não | `—` |
| `entity_id` | `varchar(50)` | — | sim | `—` |
| `old_data` | `text` | — | sim | `—` |
| `new_data` | `text` | — | sim | `—` |
| `created_at` | `timestamp` | — | não | `now()` |
| `unit_id` | `integer` | FK | sim | `—` |
| `actor_type` | `varchar(20)` | — | não | `'USER'::character varying` |
| `actor_identifier` | `varchar(64)` | — | sim | `—` |
| `description` | `varchar(255)` | — | não | `'Evento legado'::character varying` |
| `outcome` | `audit_logs_outcome_enum` | — | não | `'SUCCESS'::audit_logs_outcome_enum` |
| `method` | `varchar(10)` | — | sim | `—` |
| `path` | `varchar(255)` | — | sim | `—` |
| `correlation_id` | `varchar(64)` | — | sim | `—` |
| `ip_address` | `varchar(64)` | — | sim | `—` |
| `user_agent` | `varchar(255)` | — | sim | `—` |
| `status_code` | `integer` | — | sim | `—` |

Restrições e índices:

- `FK_audit_logs_unit_id`: `FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL`.
- `FK_audit_logs_user_id`: `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL`.
- `PK_audit_logs`: `PRIMARY KEY (id)`.
- `audit_logs_action_not_null`: `NOT NULL action`.
- `audit_logs_actor_type_not_null`: `NOT NULL actor_type`.
- `audit_logs_created_at_not_null`: `NOT NULL created_at`.
- `audit_logs_description_not_null`: `NOT NULL description`.
- `audit_logs_entity_not_null`: `NOT NULL entity`.
- `audit_logs_id_not_null`: `NOT NULL id`.
- `audit_logs_outcome_not_null`: `NOT NULL outcome`.
- `IDX_audit_logs_created_at`: `CREATE INDEX "IDX_audit_logs_created_at" ON public.audit_logs USING btree (created_at)`.
- `IDX_audit_logs_entity_entity_id`: `CREATE INDEX "IDX_audit_logs_entity_entity_id" ON public.audit_logs USING btree (entity, entity_id)`.
- `IDX_audit_logs_outcome_created`: `CREATE INDEX "IDX_audit_logs_outcome_created" ON public.audit_logs USING btree (outcome, created_at)`.
- `IDX_audit_logs_unit_created`: `CREATE INDEX "IDX_audit_logs_unit_created" ON public.audit_logs USING btree (unit_id, created_at)`.
- `PK_audit_logs`: `CREATE UNIQUE INDEX "PK_audit_logs" ON public.audit_logs USING btree (id)`.

#### RateLimitCounters — `rate_limit_counters`

Limitação compartilhada de requisições por chave; tabela UNLOGGED sem FK.

Fonte: [1793100001000-SharedRateLimit.ts](../meatshop-backend/src/database/migrations/1793100001000-SharedRateLimit.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `key` | `varchar(160)` | PK | não | `—` |
| `window_started_at` | `timestamptz` | — | não | `now()` |
| `request_count` | `integer` | — | não | `0` |

Restrições e índices:

- `rate_limit_counters_key_not_null`: `NOT NULL key`.
- `rate_limit_counters_pkey`: `PRIMARY KEY (key)`.
- `rate_limit_counters_request_count_check`: `CHECK ((request_count >= 0))`.
- `rate_limit_counters_request_count_not_null`: `NOT NULL request_count`.
- `rate_limit_counters_window_started_at_not_null`: `NOT NULL window_started_at`.
- `idx_rate_limit_counters_window`: `CREATE INDEX idx_rate_limit_counters_window ON public.rate_limit_counters USING btree (window_started_at)`.
- `rate_limit_counters_pkey`: `CREATE UNIQUE INDEX rate_limit_counters_pkey ON public.rate_limit_counters USING btree (key)`.

#### SocketIoAttachments — `socket_io_attachments`

Payloads binários do adaptador Socket.IO; ID único, sem PK e sem FKs.

Fonte: [1792790400000-CompleteFunctionalGaps.ts](../meatshop-backend/src/database/migrations/1792790400000-CompleteFunctionalGaps.ts).

| Atributo | Tipo SQL | Chaves | NULL | Padrão |
|---|---|---|---|---|
| `id` | `bigint` | UK | não | `nextval('socket_io_attachments_id_seq'::regclass)` |
| `created_at` | `timestamptz` | — | sim | `now()` |
| `payload` | `bytea` | — | sim | `—` |

Restrições e índices:

- `socket_io_attachments_id_key`: `UNIQUE (id)`.
- `socket_io_attachments_id_not_null`: `NOT NULL id`.
- `idx_socket_io_attachments_created`: `CREATE INDEX idx_socket_io_attachments_created ON public.socket_io_attachments USING btree (created_at)`.
- `socket_io_attachments_id_key`: `CREATE UNIQUE INDEX socket_io_attachments_id_key ON public.socket_io_attachments USING btree (id)`.

## Todos os relacionamentos com FK

| Pai | Filho | FK no filho → chave do pai | Pai : filho | ON DELETE |
|---|---|---|---|---|
| `addresses` | `orders` | `address_id` → `id` | 0..1 : 0..N | RESTRICT |
| `ai_conversations` | `ai_messages` | `conversation_id` → `id` | 1 : 0..N | CASCADE |
| `cart` | `cart_items` | `cart_id` → `id` | 1 : 0..N | CASCADE |
| `categories` | `products` | `category_id` → `id` | 1 : 0..N | RESTRICT |
| `coupons` | `coupon_redemptions` | `coupon_id` → `id` | 1 : 0..N | RESTRICT |
| `coupons` | `coupon_units` | `coupon_id` → `id` | 1 : 0..N | CASCADE |
| `coupons` | `orders` | `coupon_id` → `id` | 0..1 : 0..N | SET NULL |
| `delivery_persons` | `delivery_goals` | `delivery_person_id` → `id` | 1 : 0..N | CASCADE |
| `delivery_persons` | `delivery_offer_rejections` | `delivery_person_id` → `id` | 1 : 0..N | CASCADE |
| `delivery_persons` | `delivery_reviews` | `delivery_person_id` → `id` | 1 : 0..N | CASCADE |
| `delivery_persons` | `delivery_settlements` | `delivery_person_id` → `id` | 1 : 0..N | NO ACTION |
| `delivery_persons` | `orders` | `delivery_person_id` → `id` | 0..1 : 0..N | SET NULL |
| `delivery_persons` | `vehicles` | `delivery_person_id` → `id` | 1 : 0..N | CASCADE |
| `legal_documents` | `legal_acceptances` | `document_id` → `id` | 1 : 0..N | RESTRICT |
| `orders` | `chat_messages` | `order_id` → `id` | 1 : 0..N | CASCADE |
| `orders` | `coupon_redemptions` | `order_id` → `id` | 1 : 0..1 | RESTRICT |
| `orders` | `delivery_offer_rejections` | `order_id` → `id` | 1 : 0..N | CASCADE |
| `orders` | `delivery_reviews` | `order_id` → `id` | 1 : 0..1 | CASCADE |
| `orders` | `delivery_settlements` | `order_id` → `id` | 1 : 0..1 | NO ACTION |
| `orders` | `delivery_tracking` | `order_id` → `id` | 1 : 0..N | CASCADE |
| `orders` | `order_items` | `order_id` → `id` | 1 : 0..N | CASCADE |
| `orders` | `order_status_history` | `order_id` → `id` | 1 : 0..N | CASCADE |
| `orders` | `payment_manual_events` | `order_id` → `id` | 1 : 0..N | NO ACTION |
| `orders` | `payment_notifications` | `order_id` → `id` | 1 : 0..N | CASCADE |
| `orders` | `payment_refunds` | `order_id` → `id` | 0..1 : 0..N | NO ACTION |
| `orders` | `payments` | `order_id` → `id` | 1 : 0..1 | CASCADE |
| `orders` | `reviews` | `order_id` → `id` | 1 : 0..N | CASCADE |
| `orders` | `support_tickets` | `order_id` → `id` | 0..1 : 0..N | SET NULL |
| `payment_refunds` | `payment_refund_attempts` | `refund_id` → `id` | 1 : 0..N | NO ACTION |
| `products` | `cart_items` | `product_id` → `id` | 1 : 0..N | CASCADE |
| `products` | `order_items` | `product_id` → `id` | 1 : 0..N | RESTRICT |
| `products` | `product_images` | `product_id` → `id` | 1 : 0..N | CASCADE |
| `products` | `promotions` | `product_id` → `id` | 1 : 0..N | CASCADE |
| `products` | `recipe_products` | `product_id` → `id` | 1 : 0..N | CASCADE |
| `products` | `reviews` | `product_id` → `id` | 0..1 : 0..N | CASCADE |
| `products` | `stock` | `product_id` → `id` | 1 : 0..1 | CASCADE |
| `recipes` | `recipe_ingredients` | `recipe_id` → `id` | 1 : 0..N | CASCADE |
| `recipes` | `recipe_products` | `recipe_id` → `id` | 1 : 0..N | CASCADE |
| `recipes` | `recipe_steps` | `recipe_id` → `id` | 1 : 0..N | CASCADE |
| `support_messages` | `support_attachments` | `message_id` → `id` | 1 : 0..N | CASCADE |
| `support_tickets` | `support_messages` | `ticket_id` → `id` | 1 : 0..N | CASCADE |
| `units` | `audit_logs` | `unit_id` → `id` | 0..1 : 0..N | SET NULL |
| `units` | `business_hours` | `unit_id` → `id` | 1 : 0..N | CASCADE |
| `units` | `categories` | `unit_id` → `id` | 1 : 0..N | CASCADE |
| `units` | `coupon_redemptions` | `unit_id` → `id` | 1 : 0..N | RESTRICT |
| `units` | `coupon_units` | `unit_id` → `id` | 1 : 0..N | CASCADE |
| `units` | `coupons` | `unit_id` → `id` | 0..1 : 0..N | CASCADE |
| `units` | `expenses` | `unit_id` → `id` | 1 : 0..N | RESTRICT |
| `units` | `legal_acceptances` | `unit_id` → `id` | 0..1 : 0..N | RESTRICT |
| `units` | `notifications` | `unit_id` → `id` | 0..1 : 0..N | CASCADE |
| `units` | `orders` | `unit_id` → `id` | 1 : 0..N | RESTRICT |
| `units` | `payment_oauth_states` | `unit_id` → `id` | 1 : 0..N | NO ACTION |
| `units` | `payment_refunds` | `unit_id` → `id` | 1 : 0..N | NO ACTION |
| `units` | `payment_seller_events` | `unit_id` → `id` | 1 : 0..N | NO ACTION |
| `units` | `payment_sellers` | `unit_id` → `id` | 1 : 0..1 | NO ACTION |
| `units` | `payment_transactions` | `unit_id` → `id` | 1 : 0..N | NO ACTION |
| `units` | `products` | `unit_id` → `id` | 1 : 0..N | CASCADE |
| `units` | `promotions` | `unit_id` → `id` | 1 : 0..N | CASCADE |
| `units` | `recipes` | `unit_id` → `id` | 1 : 0..N | CASCADE |
| `units` | `reviews` | `unit_id` → `id` | 1 : 0..N | CASCADE |
| `units` | `support_tickets` | `unit_id` → `id` | 0..1 : 0..N | SET NULL |
| `units` | `user_units` | `unit_id` → `id` | 1 : 0..N | CASCADE |
| `users` | `addresses` | `user_id` → `id` | 1 : 0..N | CASCADE |
| `users` | `ai_conversations` | `user_id` → `id` | 1 : 0..N | CASCADE |
| `users` | `ai_rate_limits` | `user_id` → `id` | 1 : 0..1 | CASCADE |
| `users` | `audit_logs` | `user_id` → `id` | 0..1 : 0..N | SET NULL |
| `users` | `cart` | `user_id` → `id` | 1 : 0..1 | CASCADE |
| `users` | `chat_messages` | `receiver_id` → `id` | 1 : 0..N | RESTRICT |
| `users` | `chat_messages` | `sender_id` → `id` | 1 : 0..N | RESTRICT |
| `users` | `coupon_redemptions` | `user_id` → `id` | 1 : 0..N | RESTRICT |
| `users` | `coupons` | `created_by` → `id` | 1 : 0..N | RESTRICT |
| `users` | `delivery_expenses` | `user_id` → `id` | 1 : 0..N | NO ACTION |
| `users` | `delivery_persons` | `user_id` → `id` | 1 : 0..1 | CASCADE |
| `users` | `delivery_reviews` | `client_id` → `id` | 1 : 0..N | CASCADE |
| `users` | `delivery_settlements` | `actor_id` → `id` | 1 : 0..N | NO ACTION |
| `users` | `legal_acceptances` | `user_id` → `id` | 1 : 0..N | RESTRICT |
| `users` | `notification_preferences` | `user_id` → `id` | 1 : 0..1 | CASCADE |
| `users` | `notifications` | `user_id` → `id` | 1 : 0..N | CASCADE |
| `users` | `order_status_history` | `updated_by` → `id` | 0..1 : 0..N | SET NULL |
| `users` | `orders` | `client_id` → `id` | 1 : 0..N | RESTRICT |
| `users` | `payment_manual_events` | `actor_id` → `id` | 1 : 0..N | NO ACTION |
| `users` | `payment_oauth_states` | `user_id` → `id` | 1 : 0..N | NO ACTION |
| `users` | `payment_refund_attempts` | `actor_id` → `id` | 0..1 : 0..N | NO ACTION |
| `users` | `payment_refunds` | `retry_requested_by` → `id` | 0..1 : 0..N | NO ACTION |
| `users` | `payment_seller_events` | `actor_id` → `id` | 0..1 : 0..N | NO ACTION |
| `users` | `promotions` | `created_by` → `id` | 1 : 0..N | RESTRICT |
| `users` | `refresh_tokens` | `user_id` → `id` | 1 : 0..N | CASCADE |
| `users` | `reviews` | `client_id` → `id` | 1 : 0..N | CASCADE |
| `users` | `support_messages` | `sender_id` → `id` | 1 : 0..N | RESTRICT |
| `users` | `support_tickets` | `assigned_to` → `id` | 0..1 : 0..N | SET NULL |
| `users` | `support_tickets` | `responded_by` → `id` | 0..1 : 0..N | SET NULL |
| `users` | `support_tickets` | `user_id` → `id` | 1 : 0..N | CASCADE |
| `users` | `units` | `admin_id` → `id` | 1 : 0..N | RESTRICT |
| `users` | `user_device_tokens` | `user_id` → `id` | 1 : 0..N | CASCADE |
| `users` | `user_units` | `user_id` → `id` | 1 : 0..N | CASCADE |

## Vínculos lógicos sem FK

Os identificadores abaixo são usados pela aplicação ou por triggers, mas o banco não garante a existência do registro referenciado. IDs de pagamentos se referem ao provedor; um webhook pode chegar antes de a transação existir localmente. A imagem usa `ref` nesses vínculos e não atribui uma cardinalidade garantida pelo banco.

| Campo de origem | Referência lógica |
|---|---|
| `delivery_tracking.delivery_person_id` | `delivery_persons.id` |
| `orders.tracking_consent_user_id` | `users.id` |
| `payments.received_by` | `users.id` |
| `payments.transaction_id` | `payment_transactions.id` |
| `payment_refunds.requested_by` | `users.id` |
| `payment_refunds.payment_id` | `payment_transactions.id` |
| `payment_webhook_events.unit_id` | `units.id` |
| `payment_webhook_events.payment_id` | `payment_transactions.id` |
| `delivery_earnings_events.order_id` | `orders.id` |
| `delivery_earnings_events.user_id` | `users.id` |

## Tabelas sem FKs de saída

`auth_login_attempts`, `delivery_earnings_events`, `legal_documents`, `payment_webhook_events`, `rate_limit_counters`, `sales`, `socket_io_attachments`, `users`.

`expenses.supplierId` é um identificador textual: não existe tabela Supplier neste esquema. Referências polimórficas de auditoria (`entity`, `entity_id`) não correspondem a FKs. `payment_transactions.reference`, `payments.payment_reference` e os IDs de preferência/cliente/coletor são referências operacionais ou externas, não novas entidades locais.

## Valores dos enums

- `addresses_label_enum`: `Casa`, `Trabalho`, `Outro`.
- `audit_logs_outcome_enum`: `SUCCESS`, `FAILURE`.
- `business_hours_weekday_enum`: `SUNDAY`, `MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, `SATURDAY`.
- `chat_messages_participant_type_enum`: `UNIT`, `DELIVERY_PERSON`, `UNIT_DELIVERY_PERSON`.
- `coupon_redemptions_status_enum`: `REDEEMED`, `RELEASED`.
- `coupons_discount_type_enum`: `PERCENTAGE`, `FIXED`.
- `coupons_type_enum`: `PLATFORM`, `UNIT`.
- `delivery_goals_period_enum`: `daily`, `weekly`, `monthly`.
- `delivery_persons_affiliation_type_enum`: `AUTONOMOUS`, `UNIT`.
- `delivery_persons_status_enum`: `PENDING`, `ACTIVE`, `INACTIVE`.
- `delivery_persons_vehicle_enum`: `MOTORCYCLE`, `CAR`, `BIKE`.
- `notifications_type_enum`: `ORDER`, `DELIVERY`, `PROMOTION`, `SYSTEM`.
- `order_status_history_status_enum`: `PENDING`, `CONFIRMED`, `PREPARING`, `READY`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`.
- `orders_cancelled_by_enum`: `CLIENT`, `UNIT`, `SYSTEM`.
- `orders_delivery_status_enum`: `WAITING_DELIVERY_PERSON`, `PICKUP`, `ON_THE_WAY`, `DELIVERED`.
- `orders_delivery_step_enum`: `PICKUP`, `DELIVERING`.
- `orders_delivery_type_enum`: `DELIVERY`, `PICKUP`.
- `orders_payment_status_enum`: `PENDING`, `PAID`, `REJECTED`, `REFUNDED`, `CANCELLED`, `PARTIALLY_REFUNDED`, `CHARGED_BACK`.
- `orders_paymentmethod_enum`: `Pix`, `Credit`, `Debit`, `Cash`, `Bank Slip`, `Mercado Pago Balance`.
- `orders_status_enum`: `PENDING`, `CONFIRMED`, `PREPARING`, `READY`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`.
- `payments_method_enum`: `Pix`, `Credit`, `Debit`, `Cash`, `Bank Slip`, `Mercado Pago Balance`, `Card on Delivery`.
- `payments_status_enum`: `PENDING`, `PAID`, `REJECTED`, `REFUNDED`, `CANCELLED`, `PARTIALLY_REFUNDED`, `CHARGED_BACK`.
- `support_tickets_category_enum`: `ACCOUNT`, `BILLING`, `ORDER`, `TECHNICAL`, `SUGGESTION`, `OTHER`.
- `support_tickets_priority_enum`: `LOW`, `NORMAL`, `HIGH`, `URGENT`.
- `support_tickets_status_enum`: `OPEN`, `ANSWERED`, `CLOSED`, `WAITING_SUPPORT`, `WAITING_USER`.
- `user_units_local_role_enum`: `OWNER`, `MANAGER`, `OPERATOR`, `DELIVERY`.
- `user_units_status_enum`: `ACTIVE`, `INACTIVE`.
- `users_app_profile_enum`: `CLIENT`, `DELIVERY`, `BOTH`.
- `users_global_role_enum`: `SUPER_ADMIN`, `USER`.
- `vehicles_type_enum`: `MOTORCYCLE`, `CAR`, `BIKE`.

## Diferenças em relação ao DER anterior

- `saved_payment_methods` foi removida por `1793300001000-RetireSavedPaymentMethods.ts` e não integra o esquema atual.
- Incluídas as tabelas definidas somente em SQL, incluindo `rate_limit_counters` (UNLOGGED), filas de pagamentos, despesas e eventos de ganhos.
- O veículo ativo é indicado por `vehicles.is_active`; não existe FK `active_vehicle_id`.
- Unicidade de CPF e telefone usa `cpf_hash` e `phone_hash`; os valores originais são criptografados.
- `socket_io_attachments.id` é UNIQUE, mas não é uma chave primária.
- Nomes de tabelas, tipos, nulabilidade, FKs e cardinalidades seguem o resultado das migrations, inclusive quando diferem de decorators do ORM.

## Regeneração e verificação

Com as dependências do backend instaladas e Python com Pillow disponível, execute na raiz:

```powershell
node scripts/der-schema.cjs
python scripts/render-der.py
powershell -File scripts/render-der-images.ps1
```

O primeiro comando aplica todas as migrations em memória e consulta os catálogos PostgreSQL. O segundo confere a cobertura das entidades e referências e gera estes artefatos. Nenhum dos comandos conecta ao banco de desenvolvimento ou produção. O snapshot representa o código versionado, não confirma o estado de um ambiente implantado.

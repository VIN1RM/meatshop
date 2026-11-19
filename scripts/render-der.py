"""Generate Markdown and Mermaid sources from the verified migration snapshot."""
from pathlib import Path
import json
import re
import html

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs'
schema = json.loads((DOCS / 'DER_SCHEMA.json').read_text(encoding='utf-8'))
tables = {t['name']: t for t in schema['tables']}
entities = {}
sources = {}
for file in (ROOT / 'meatshop-backend/src').rglob('*.entity.ts'):
    content = file.read_text(encoding='utf-8')
    table = re.search(r"@Entity\('([^']+)'\)", content)
    name = re.search(r'export class (\w+)', content)
    if table and name:
        entities[table[1]] = name[1].replace('RefreshTokenEntity', 'RefreshToken')
        sources[table[1]] = file.relative_to(DOCS.parent).as_posix()
for name in tables:
    entities.setdefault(name, ''.join(s.capitalize() for s in name.split('_')))
    if name not in sources:
        for file in (ROOT / 'meatshop-backend/src/database/migrations').glob('*.ts'):
            if re.search(r'CREATE (?:UNLOGGED )?TABLE\s+"?' + name + r'["\s(]', file.read_text(encoding='utf-8')):
                sources[name] = file.relative_to(ROOT).as_posix()
                break

domains = {
    'Identidade e unidades': 'users addresses refresh_tokens auth_login_attempts units user_units business_hours',
    'Catálogo e compras': 'categories products product_images stock cart cart_items promotions coupons coupon_units coupon_redemptions sales',
    'Pedidos e avaliações': 'orders order_items order_status_history payments reviews delivery_reviews chat_messages',
    'Entregadores e financeiro': 'delivery_persons vehicles delivery_tracking delivery_goals delivery_offer_rejections delivery_expenses delivery_settlements delivery_earnings_events expenses',
    'Operações de pagamentos': 'payment_sellers payment_oauth_states payment_transactions payment_refunds payment_refund_attempts payment_manual_events payment_notifications payment_seller_events payment_webhook_events',
    'Suporte e notificações': 'support_tickets support_messages support_attachments notifications notification_preferences user_device_tokens',
    'Receitas': 'recipes recipe_steps recipe_ingredients recipe_products',
    'IA, documentos e infraestrutura': 'ai_conversations ai_messages ai_rate_limits legal_documents legal_acceptances audit_logs rate_limit_counters socket_io_attachments',
}
assert sorted(n for names in domains.values() for n in names.split()) == sorted(tables)
purposes = {
    'users': 'Contas, identidade, autenticação e perfil de acesso.',
    'addresses': 'Endereços e coordenadas dos usuários.',
    'refresh_tokens': 'Sessões renováveis e revogação de tokens.',
    'auth_login_attempts': 'Controle de tentativas de login por hash de identidade, sem FK para usuário.',
    'units': 'Unidades comerciais, administrador, localização e configuração de entregas.',
    'user_units': 'Associação entre usuário e unidade, com papel e situação local.',
    'business_hours': 'Horários de funcionamento por unidade e dia da semana.',
    'categories': 'Categorias de produtos por unidade.',
    'products': 'Catálogo e preços de produtos da unidade.',
    'product_images': 'Imagens adicionais de produtos.',
    'stock': 'Saldo e quantidade mínima de estoque por produto.',
    'cart': 'Carrinho de compras de um usuário.',
    'cart_items': 'Produtos, quantidades e preços do carrinho.',
    'promotions': 'Promoções de produtos, unidade e usuário criador.',
    'coupons': 'Definição, escopo, regras e limites dos cupons.',
    'coupon_units': 'Associação de cupons às unidades permitidas.',
    'coupon_redemptions': 'Uso do cupom em pedido, usuário e unidade.',
    'sales': 'Cadastro legado de campanhas com imagem e desconto; sem FK para pedidos ou unidades.',
    'orders': 'Pedidos, valores, entrega, agendamento e dados de rastreamento.',
    'order_items': 'Itens do pedido e snapshot do produto.',
    'order_status_history': 'Histórico de estados e usuário responsável pela alteração.',
    'payments': 'Pagamento associado ao pedido e informações de conciliação e recebimento.',
    'reviews': 'Avaliações de unidade e, opcionalmente, produto no contexto do pedido.',
    'delivery_reviews': 'Avaliação do entregador por pedido.',
    'chat_messages': 'Mensagens entre participantes de um pedido.',
    'delivery_persons': 'Perfil do entregador, vínculo, disponibilidade e avaliação.',
    'vehicles': 'Veículos do entregador, incluindo flags de ativação.',
    'delivery_tracking': 'Amostras de localização de uma entrega.',
    'delivery_goals': 'Metas do entregador por período.',
    'delivery_offer_rejections': 'Recusas de ofertas de entrega e motivos.',
    'delivery_expenses': 'Despesas pessoais do entregador, vinculadas à conta de usuário.',
    'delivery_settlements': 'Acerto recebido pelo entregador, com responsável pelo registro.',
    'delivery_earnings_events': 'Fila de eventos de ganhos gerados por triggers; IDs sem FKs declaradas.',
    'expenses': 'Despesas administrativas da unidade e dados de pagamento e fornecedor.',
    'payment_sellers': 'Credenciais OAuth e situação da conta recebedora por unidade.',
    'payment_oauth_states': 'Estados temporários da autorização OAuth de pagamentos.',
    'payment_transactions': 'Transações externas e valores conciliados por unidade.',
    'payment_refunds': 'Solicitações de reembolso e controle de retentativas.',
    'payment_refund_attempts': 'Histórico de tentativas de reembolso.',
    'payment_manual_events': 'Registros manuais de recebimento vinculados ao pedido e operador.',
    'payment_notifications': 'Fila de notificações de estado de pagamento.',
    'payment_seller_events': 'Histórico de operações na conta recebedora da unidade.',
    'payment_webhook_events': 'Fila persistente de webhooks; IDs externos e unidade sem FKs declaradas.',
    'support_tickets': 'Chamados com solicitante, unidade, pedido, responsável e resposta.',
    'support_messages': 'Mensagens do chamado e respectivos remetentes.',
    'support_attachments': 'Arquivos anexados às mensagens de suporte.',
    'notifications': 'Notificações do usuário e contexto opcional de unidade.',
    'notification_preferences': 'Preferências de notificação por usuário.',
    'user_device_tokens': 'Tokens FCM dos dispositivos do usuário.',
    'recipes': 'Receitas publicadas pela unidade.',
    'recipe_steps': 'Etapas de preparo da receita.',
    'recipe_ingredients': 'Ingredientes e quantidades da receita.',
    'recipe_products': 'Produtos associados à receita e chamadas para compra.',
    'ai_conversations': 'Conversas do assistente com prazo de retenção.',
    'ai_messages': 'Mensagens das conversas do assistente.',
    'ai_rate_limits': 'Contador de requisições de IA por usuário.',
    'legal_documents': 'Versões de documentos legais e indicação de revogabilidade.',
    'legal_acceptances': 'Eventos de aceite ou revogação, usuário e unidade opcional.',
    'audit_logs': 'Eventos de auditoria, ator, unidade, resultado e alterações.',
    'rate_limit_counters': 'Limitação compartilhada de requisições por chave; tabela UNLOGGED sem FK.',
    'socket_io_attachments': 'Payloads binários do adaptador Socket.IO; ID único, sem PK e sem FKs.',
}

def cols(definition):
    return [s.strip().strip('"') for s in definition.split(',')]

relations = []
for t in tables.values():
    t['pk'] = []
    t['unique'] = []
    for c in t['constraints']:
        if c['type'] in ('p', 'u'):
            keys = cols(re.search(r'\(([^)]+)\)', c['definition'])[1])
            if c['type'] == 'p': t['pk'] = keys
            t['unique'].append(keys)
    for idx in t['indexes']:
        if 'CREATE UNIQUE INDEX' in idx['definition'] and ' WHERE ' not in idx['definition']:
            match = re.search(r'USING btree \(([^)]+)\)', idx['definition'])
            if match: t['unique'].append(cols(match[1]))
    for c in t['constraints']:
        if c['type'] != 'f': continue
        m = re.search(r'FOREIGN KEY \(([^)]+)\) REFERENCES ([\w"]+)\(([^)]+)\)', c['definition'])
        assert m, c
        keys, parent, target = cols(m[1]), m[2].strip('"'), cols(m[3])
        optional = any(col['nullable'] for col in t['columns'] if col['name'] in keys)
        single = any(set(u).issubset(keys) for u in t['unique'])
        action = re.search(r'ON DELETE ([A-Z ]+?)(?: ON UPDATE|$)', c['definition'])
        relations.append(dict(child=t['name'], parent=parent, keys=keys, target=target,
                              optional=optional, single=single, delete=action[1] if action else 'NO ACTION', name=c['name']))

# References used by application code that are deliberately not SQL foreign keys.
logical = [
    ('delivery_tracking', 'delivery_person_id', 'delivery_persons', 'id'),
    ('orders', 'tracking_consent_user_id', 'users', 'id'),
    ('payments', 'received_by', 'users', 'id'),
    ('payments', 'transaction_id', 'payment_transactions', 'id'),
    ('payment_refunds', 'requested_by', 'users', 'id'),
    ('payment_refunds', 'payment_id', 'payment_transactions', 'id'),
    ('payment_webhook_events', 'unit_id', 'units', 'id'),
    ('payment_webhook_events', 'payment_id', 'payment_transactions', 'id'),
    ('delivery_earnings_events', 'order_id', 'orders', 'id'),
    ('delivery_earnings_events', 'user_id', 'users', 'id'),
]
for child, key, parent, target in logical:
    assert key in [c['name'] for c in tables[child]['columns']]
    assert target in [c['name'] for c in tables[parent]['columns']]

def dtype(c):
    if c['type'] == 'USER-DEFINED': return c['udt_name']
    if c['type'] == 'character varying': return 'varchar' + (f"({c['length']})" if c['length'] else '')
    if c['type'] == 'numeric': return f"numeric({c['precision']},{c['scale']})" if c['precision'] else 'numeric'
    return {'timestamp with time zone':'timestamptz', 'timestamp without time zone':'timestamp', 'time without time zone':'time'}.get(c['type'], c['type'])

def flags(t, c):
    result = []
    if c['name'] in t['pk']: result.append('PK')
    if any(c['name'] in r['keys'] for r in relations if r['child']==t['name']): result.append('FK')
    if [c['name']] in t['unique'] and c['name'] not in t['pk']: result.append('UK')
    return result

def cardinal(r):
    return ('0..1' if r['optional'] else '1') + ' : ' + ('0..1' if r['single'] else '0..N')

md = [
    '# DER completo do Meatshop', '',
    f"Esquema reconstruído a partir das **{len(schema['migrations'])} migrations** do repositório, em PostgreSQL isolado em memória (PGlite), sem acessar o banco da aplicação ou ler arquivos `.env`. São **{len(tables)} tabelas**, **{len(relations)} FKs** e **{len(logical)} vínculos lógicos documentados**. A tabela interna de controle do TypeORM (`migrations`) não é criada pelas migrations e não faz parte deste levantamento.", '',
    '[Abrir imagem SVG completa](DER_COMPLETO.svg) · [Imagem PNG completa](DER_COMPLETO.png) · [Fonte Mermaid](DER_ATUALIZADO.mmd) · [Snapshot do esquema](DER_SCHEMA.json)', '',
    '![DER completo; abra o SVG para ampliar e ler todos os atributos](DER_COMPLETO.svg)', '',
    '## Como ler', '',
    'A imagem apresenta cada tabela com todos os atributos. Ao lado de cada tabela ficam os nós de referência dos seus pais, ligados por setas rotuladas com a FK e a cardinalidade. Os nós de referência repetem nomes para evitar cruzamentos entre dezenas de linhas; a definição completa de cada tabela aparece uma única vez. Setas contínuas são FKs e tracejadas são vínculos lógicos sem integridade referencial declarada. Amplie o SVG para ler os campos ou use as imagens por área abaixo.', '',
    '`PK`: chave primária; `FK`: chave estrangeira; `UK`: unicidade de uma coluna. Chaves compostas e índices únicos parciais estão descritos nas restrições e índices de cada entidade. `NULL` informa se o atributo é opcional. A cardinalidade é apresentada na ordem **pai : filho**: `1 : 0..N` significa que cada filho exige um pai e cada pai pode ter nenhum ou vários filhos. `0..1 : 0..N` permite que o filho não tenha pai. Uma FK não obriga o pai a ter filhos.', '',
    '## Imagens por área', '',
]
for i, (domain, names) in enumerate(domains.items(), 1):
    md.append(f'- [{domain}](der/area-{i}.svg)')
md += ['', '## Entidades e atributos', '']
for domain, names in domains.items():
    md += [f'### {domain}', '']
    for name in names.split():
        t = tables[name]
        md += [f'#### {entities[name]} — `{name}`', '', purposes[name], '',
               f"Fonte: [{Path(sources[name]).name}](../{sources[name]}).", '',
               '| Atributo | Tipo SQL | Chaves | NULL | Padrão |',
               '|---|---|---|---|---|']
        for c in t['columns']:
            default = str(c['default'] or '—').replace('|', '\\|')
            md.append(f"| `{c['name']}` | `{dtype(c)}` | {', '.join(flags(t,c)) or '—'} | {'sim' if c['nullable'] else 'não'} | `{default}` |")
        md += ['', 'Restrições e índices:', '']
        for c in t['constraints']:
            md.append(f"- `{c['name']}`: `{c['definition']}`.")
        for idx in t['indexes']:
            md.append(f"- `{idx['name']}`: `{idx['definition']}`.")
        md += ['']
md += ['## Todos os relacionamentos com FK', '',
       '| Pai | Filho | FK no filho → chave do pai | Pai : filho | ON DELETE |',
       '|---|---|---|---|---|']
for r in sorted(relations, key=lambda r:(r['parent'],r['child'],r['keys'])):
    md.append(f"| `{r['parent']}` | `{r['child']}` | `{', '.join(r['keys'])}` → `{', '.join(r['target'])}` | {cardinal(r)} | {r['delete']} |")
md += ['', '## Vínculos lógicos sem FK', '',
       'Os identificadores abaixo são usados pela aplicação ou por triggers, mas o banco não garante a existência do registro referenciado. IDs de pagamentos se referem ao provedor; um webhook pode chegar antes de a transação existir localmente. A imagem usa `ref` nesses vínculos e não atribui uma cardinalidade garantida pelo banco.', '',
       '| Campo de origem | Referência lógica |', '|---|---|']
for child, key, parent, target in logical:
    md.append(f'| `{child}.{key}` | `{parent}.{target}` |')
md += ['', '## Tabelas sem FKs de saída', '',
       ', '.join(f'`{n}`' for n in tables if not any(r['child']==n for r in relations)) + '.', '',
       '`expenses.supplierId` é um identificador textual: não existe tabela Supplier neste esquema. Referências polimórficas de auditoria (`entity`, `entity_id`) não correspondem a FKs. `payment_transactions.reference`, `payments.payment_reference` e os IDs de preferência/cliente/coletor são referências operacionais ou externas, não novas entidades locais.', '',
       '## Valores dos enums', '']
for enum in schema['enums']:
    md.append(f"- `{enum['name']}`: " + ', '.join(f'`{v}`' for v in enum['values']) + '.')
md += ['', '## Diferenças em relação ao DER anterior', '',
       '- `saved_payment_methods` foi removida por `1793300001000-RetireSavedPaymentMethods.ts` e não integra o esquema atual.',
       '- Incluídas as tabelas definidas somente em SQL, incluindo `rate_limit_counters` (UNLOGGED), filas de pagamentos, despesas e eventos de ganhos.',
       '- O veículo ativo é indicado por `vehicles.is_active`; não existe FK `active_vehicle_id`.',
       '- Unicidade de CPF e telefone usa `cpf_hash` e `phone_hash`; os valores originais são criptografados.',
       '- `socket_io_attachments.id` é UNIQUE, mas não é uma chave primária.',
       '- Nomes de tabelas, tipos, nulabilidade, FKs e cardinalidades seguem o resultado das migrations, inclusive quando diferem de decorators do ORM.', '',
       '## Regeneração e verificação', '',
       'Com as dependências do backend instaladas e Python com Pillow disponível, execute na raiz:', '',
       '```powershell', 'node scripts/der-schema.cjs', 'python scripts/render-der.py', 'powershell -File scripts/render-der-images.ps1', '```', '',
       'O primeiro comando aplica todas as migrations em memória e consulta os catálogos PostgreSQL. O segundo confere a cobertura das entidades e referências e gera estes artefatos. Nenhum dos comandos conecta ao banco de desenvolvimento ou produção. O snapshot representa o código versionado, não confirma o estado de um ambiente implantado.', '']
(DOCS / 'DER_COMPLETO.md').write_text('\n'.join(md), encoding='utf-8')

mmd = ['---', 'config:', '  layout: elk', '  theme: default', '  er:', '    useMaxWidth: false', '---', 'erDiagram', '    direction TB', '']
for t in tables.values():
    mmd.append(f"    {t['name']} {{")
    for c in t['columns']:
        typ = re.sub(r'[^\w]', '_', dtype(c))
        keys = ','.join(flags(t,c))
        mmd.append(f"        {typ} {c['name']} {keys} \"{'NULL' if c['nullable'] else 'NOT NULL'}\"")
    mmd += ['    }', '']
for r in relations:
    left = 'o|' if r['optional'] else '||'
    right = 'o|' if r['single'] else 'o{'
    mmd.append(f"    {r['parent']} {left}--{right} {r['child']} : \"{', '.join(r['keys'])}\"")
for child, key, parent, target in logical:
    mmd.append(f'    {parent} |o..o{{ {child} : "ref {key} sem FK"')
(DOCS / 'DER_ATUALIZADO.mmd').write_text('\n'.join(mmd)+'\n', encoding='utf-8')


# Domain diagrams include full definitions of direct parents, without duplicate nodes.
(DOCS/'der').mkdir(exist_ok=True)
for i,(domain,names) in enumerate(domains.items(),1):
    chosen=set(names.split())
    selected_relations=[r for r in relations if r['child'] in chosen]
    selected_logical=[r for r in logical if r[0] in chosen]
    included=chosen | {r['parent'] for r in selected_relations} | {r[2] for r in selected_logical}
    content=mmd[:mmd.index('')+1]
    for name in tables:
        if name not in included: continue
        start=mmd.index(f'    {name} {{')
        end=mmd.index('    }',start)
        content+=mmd[start:end+1]+['']
    for r in selected_relations:
        left='o|' if r['optional'] else '||'
        right='o|' if r['single'] else 'o{'
        content.append(f"    {r['parent']} {left}--{right} {r['child']} : \"{', '.join(r['keys'])}\"")
    for child,key,parent,target in selected_logical:
        content.append(f'    {parent} |o..o{{ {child} : "ref {key} sem FK"')
    (DOCS/'der'/f'area-{i}.mmd').write_text('\n'.join(content)+'\n',encoding='utf-8')
print(f"Generated {len(tables)} entities, {len(relations)} FKs and {len(logical)} logical references.")

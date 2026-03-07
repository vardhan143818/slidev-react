# Diagnostic Rubric

## Use This File For

- 多层次诊断
- 评分式审计
- 输出固定模板
- 判断先拆哪里最划算

## Levels

### Strategic Level

检查：

- 当前结构是否匹配产品阶段
- 未来 1-2 个能力增量最可能压垮哪里
- 当前复杂度是在支撑核心能力，还是在消化历史偶然性
- 现在做重构是否真的值

### System Level

检查：

- 是否能一眼说清这个项目有哪些主要 runtime
- authoring/build 与 presentation/runtime 是否清晰分开
- 依赖方向是否稳定
- 复杂度是否集中在少数明确的地方

### Feature Level

检查：

- 每个 feature 是否回答一个清楚的问题
- 一个 feature 内是否混入多个 runtime
- provider / hook / component 的职责是否清楚
- 改动一个 feature 是否会牵一大片

### File Level

检查：

- 文件是否同时承担规则、编排、展示
- 命名是否低估或掩盖真实职责
- 是否存在为了“复用”而抽出的伪抽象
- 副作用是否挤在 UI 文件里

## Dimensions

对主要模块按 1-5 分打分：

1. 职责清晰度
2. 状态所有权清晰度
3. 副作用隔离程度
4. 命名准确度
5. 可演进性
6. 阶段适配度
7. 调试与验证友好度

解释每个低分项的根因，不要只报分数。

## Diagnostic Questions

优先问这些问题：

1. 这个模块在表达规则、编排流程、还是展示结果？
2. 谁拥有关键状态，谁只是在消费它？
3. 浏览器 API 或网络细节是否渗进业务层？
4. hook 是在表达稳定用例，还是只把副作用搬了个地方？
5. 哪个文件最容易因为一次修改触发连锁影响？
6. 哪个重构收益最高且风险最低？
7. 这个问题如果不动，会在下一阶段演变成什么成本？
8. 这真的是结构问题，还是阶段性的可接受脏乱？

## Default Output Shape

按这个结构输出：

1. 一句话总判断
2. 更高维判断
3. 项目问题地图
4. 最关键的 3-5 个问题及根因
5. 更清晰的目标分层模型
6. 分阶段重构建议，按收益/成本排序
7. 不建议做的事

## Higher-Order Judgment

在给方案前，优先归类问题属于哪一类：

- 局部实现噪音
- runtime 边界不清
- 系统依赖方向失稳
- 产品阶段与结构错配

如果已经判断为“产品阶段与结构错配”，输出里必须明确说明：

- 下一阶段最可能新增什么能力
- 当前结构为何会先在这里失稳
- 为什么建议现在处理，而不是以后再说

## Suggested Target Model

默认推荐：

- 先按 feature 拆
- 再在 feature 内拆 `model / runtime / adapters / ui`
- 将浏览器能力视为 platform/adapters
- 将大的 orchestration component 收敛为 runtime composition root

## Anti-Patterns

遇到这些情况，优先指出：

- 用“大组件 + 一堆 effect”承接多个 runtime
- 用“通用 hooks”掩盖领域边界不清
- `utils.ts` 或 `types.ts` 成为责任黑洞
- provider 名义很小，实际承担完整 runtime
- 目录在按 feature 拆，文件却在按技术细节重新耦合
- 把“更高维判断”做成空泛战略话术，落不到具体 runtime 边界

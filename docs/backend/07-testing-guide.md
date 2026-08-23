# Backend 07 — Testing Guide (start here if you're new to writing tests)

## Where this fits

This isn't a feature to build — it's a skill to have before you write much
more of `03`–`06`. `06-orders-api.md` already assumes you can write a test
(`order-status.util.spec.ts`); this doc is where that assumption gets
explained instead of just used. Read it once, fully, then come back to it
as a reference while you write real tests for the next feature.

Every example below is real code that exists in this repo right now and
passes — `apps/api/src/auth/auth.service.spec.ts` and
`auth.controller.spec.ts`. Open them side by side with this doc; the
explanations here are annotations on that code, not a separate toy
example you'd have to translate.

## Why bother (the honest version)

Not "to catch bugs" in the abstract — a specific, concrete reason: this
codebase already had a real bug that manual testing missed. `AuthService`
returned a user object with the key `lastNane` (typo) instead of
`lastName`. `curl`-ing the endpoint and glancing at the JSON, it's easy to
not notice a five-letter misspelling in a wall of output. A test that
asserts the *exact* shape of the response —
`expect(result.user).toEqual({ ...lastName: 'User', ... })` — fails loudly
the moment that typo exists, because `toEqual` checks every key. That's
the actual value proposition: tests catch the boring, easy-to-miss bugs
so you can spend your attention on the interesting ones.

The other reason, specific to this project: you're the only person
reviewing your own code. A test suite is the closest thing to a second
pair of eyes you have — it holds a behavior fixed even after you've
forgotten why you built it a certain way, and it tells you *immediately*
when a later change breaks something, rather than "eventually, in
production."

## The testing pyramid, applied to this app

You'll hear "unit test" vs "integration test" vs "e2e test." Here's what
each one actually means for `apps/api`, in order of how many of each you
should have:

- **Unit tests** (most of them): one class, in isolation, with every
  dependency replaced by a fake. `auth.service.spec.ts` is this — it
  tests `AuthService`'s logic (does it throw on a duplicate email? does
  it lowercase the email before checking?) without ever touching a real
  database. Fast (the whole suite runs in ~2 seconds), and when one
  fails, you know exactly which class has the bug.
- **Integration tests** (fewer): multiple real pieces wired together —
  e.g. a real `TestingModule` with a real (test) database, checking that
  `AuthController` + `AuthService` + `PrismaService` actually cooperate
  correctly end to end. Nothing in this repo does this yet; it's the
  natural next step once you're comfortable with unit tests, using
  `supertest` (already installed — see `apps/api/package.json`) to fire
  real HTTP requests at a real (in-memory or test-Postgres) app instance.
- **E2E tests** (fewest, and manual for now): the `curl` sequences at the
  bottom of every `docs/backend/0X-*.md` doc are, in effect, your e2e
  tests today — running the real app against the real dev database and
  checking the real HTTP responses. Worth automating eventually
  (Playwright/Cypress hitting the real running stack), not worth building
  yet.

**Start at the top of that list, not the bottom.** A beginner's instinct
is often "let me test the whole app end to end" — that's the slowest,
flakiest, hardest-to-debug layer to start with. Unit tests are where you
build the habit.

## Jest fundamentals

Every test file has the same three-level structure:

```ts
describe('AuthService', () => {       // groups related tests — usually one per class/function
  describe('register', () => {        // a nested group per method — optional, but keeps output readable
    it('creates a user and returns an access token', async () => {
      // the actual test
    });
  });
});
```

Run `pnpm test` (or `npx jest` from `apps/api`) and Jest prints this
structure as a tree, so a failure reads as
`AuthService > register > creates a user and returns an access token`
— specific enough to know exactly what broke without opening the file.

Every test body follows the same shape, called **Arrange-Act-Assert**:

```ts
it('throws ConflictException when the email is already registered', async () => {
  // Arrange — set up the world the code under test will run against
  prisma.user.findUnique.mockResolvedValueOnce({ id: 'existing-user' });

  // Act — call the thing you're testing
  const promise = service.register({ email: 'taken@example.com', /* ... */ });

  // Assert — check what happened
  await expect(promise).rejects.toThrow(ConflictException);
});
```

If you're ever unsure how to structure a new test, write these three
comments first, then fill in the code under each one. It sounds
mechanical; it is, and that's the point — it keeps every test readable in
the same way, including your own six months from now.

### The assertions you'll actually use

| Assertion | When |
|---|---|
| `expect(x).toBe(y)` | primitives (strings, numbers, booleans) — exact `===` equality |
| `expect(x).toEqual(y)` | objects/arrays — deep equality, checks every key/value |
| `expect(x).toEqual(expect.objectContaining({...}))` | object equality but only checking *some* keys |
| `expect(fn).toThrow(SomeError)` | a synchronous function throws |
| `await expect(promise).rejects.toThrow(SomeError)` | an `async` function throws (note the `rejects`) |
| `await expect(promise).resolves.toEqual(y)` | an `async` function resolves to a value |
| `expect(mockFn).toHaveBeenCalledWith(...)` | a mock was called with specific arguments |
| `expect(mockFn).not.toHaveBeenCalled()` | a mock was *not* called — just as useful as asserting it *was* |
| `expect(x).toEqual(expect.any(String))` | "this is some string, I don't care which" — for random tokens, generated ids |

The single most common beginner mistake: using `toBe` on an object or
array. `toBe` is reference equality — `{a: 1} !== {a: 1}` even though
they look the same, because they're two different object instances.
Always use `toEqual` for objects and arrays.

## Mocking: the part that unblocks everything

This is the concept the original (broken) auth test files were missing,
and it's worth understanding *why*, not just copying the pattern.

`AuthService` depends on three things via constructor injection:
`PrismaService` (needs a real Postgres connection), `JwtService` (fine on
its own, but you don't want a test's pass/fail depending on real
cryptographic signing), and `ConfigService` (needs real env vars loaded).
A unit test for `AuthService` should test *`AuthService`'s own logic* —
the lowercasing, the duplicate check, the error messages — without caring
whether Postgres is even running. That's what mocking is: replacing a
real dependency with a fake stand-in you fully control.

```ts
// auth.service.spec.ts
function createPrismaMock() {
  return {
    user: {
      findUnique: jest.fn(),   // starts as a function that returns undefined when called
      create: jest.fn(),
    },
    // ...
  };
}
```

`jest.fn()` creates a **mock function** — a fake you can (a) control what
it returns and (b) inspect how it was called, after the fact:

```ts
// (a) control the return value for ONE call
prisma.user.findUnique.mockResolvedValueOnce(null);
// mockResolvedValueOnce because findUnique is async (returns a Promise).
// For a sync function you'd use mockReturnValueOnce instead.

// (b) inspect how it was called
expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'new@example.com' } });
```

Then you hand the mock to Nest's `TestingModule` instead of the real
class:

```ts
const module: TestingModule = await Test.createTestingModule({
  providers: [
    AuthService,                                    // the REAL class under test
    { provide: PrismaService, useValue: prisma },   // FAKE — a plain object shaped like PrismaService
    { provide: JwtService, useValue: jwt },         // FAKE
    { provide: ConfigService, useValue: { get: jest.fn() } }, // FAKE
  ],
}).compile();

service = module.get<AuthService>(AuthService);
```

`useValue` is the key — it tells Nest's DI container "when `AuthService`
asks for a `PrismaService`, hand it this plain object instead of building
a real one." `AuthService` itself is completely unaware it's talking to a
fake; it just calls `this.prisma.user.findUnique(...)` like always.

**This is exactly the fix for the bug that blocked every test in this
repo before now** — the original spec files did `providers: [AuthService]`
with nothing else, so Nest's DI container had no `PrismaService` to hand
it and failed. See `docs/backend/02-auth-api-fixes.md`'s "Tests" section
for the full story, including a second, unrelated bug (a pnpm workspace
Jest-version conflict) that was *also* blocking every test in `apps/api`
regardless of DI — worth reading once so you recognize both failure
modes if you ever see them again in a different module.

### Controller tests: mock the *service*, not its dependencies

`auth.controller.spec.ts` follows the same idea one layer up — it mocks
`AuthService` itself (not `PrismaService`/`JwtService`), because a
controller test's job is to check the *controller's* logic (does it set
the cookie? does it return the right shape? does it 401 without a
cookie?), not to re-verify `AuthService`'s internals a second time. Each
layer tests its own responsibility and trusts the layer below it — that's
what keeps the tests from becoming one giant, slow, hard-to-debug blob.

```ts
function createAuthServiceMock() {
  return {
    register: jest.fn(),
    login: jest.fn(),
    // ... one jest.fn() per method AuthController actually calls
  };
}
```

For HTTP-shaped values (`Request`/`Response`), you don't need a real
Express app either — a plain object with just the methods the controller
touches is enough:

```ts
function createResponseMock() {
  return { cookie: jest.fn(), clearCookie: jest.fn() } as unknown as Response;
}
```

## Reading the worked example end to end

Open `apps/api/src/auth/auth.service.spec.ts` now and find the
`'throws the exact same error for "no such user" and "wrong password"'`
test. This one is worth understanding specifically, because it tests a
*security property*, not just "does the code run":
`login()` must give an attacker zero signal about whether an email exists
in the system (see the comment in `auth.service.ts` above the
`UnauthorizedException` throw). The test doesn't just check that both
cases throw — it checks the two error *messages* are identical. A future
change that "helpfully" makes one message more specific (e.g.
"no account with that email") would break this test immediately, which is
exactly the point: some bugs are only bugs because of a security
property, not because the code visibly misbehaves, and a test is the only
thing that remembers to check for that property every single time.

## Running tests

```bash
pnpm test                    # from apps/api, or `pnpm turbo run test` from the repo root
npx jest auth                # only files matching "auth"
npx jest --watch             # re-runs affected tests on every save — use this while writing a new test
npx jest --coverage          # see which lines/branches nothing exercises yet
npx jest -t "throws ConflictException"   # run only tests whose name matches
```

`make check` (root `Makefile`) runs `lint`, `typecheck`, and `test`
together — the same three checks CI runs. Get in the habit of running it
before considering a feature done, not just `pnpm test` in isolation.

## What's worth testing (and what isn't)

Test:
- Anything with a decision in it — an `if`, a thrown exception, a loop
  boundary. `AuthService.login`'s "same error for both failure modes" is
  exactly this kind of thing.
- Anything you'd be embarrassed to get wrong in production — password
  hashing, token generation, the order state machine
  (`06-orders-api.md`'s `order-status.util.spec.ts` is a great second
  example to read: a *pure function*, no mocking needed at all, since it
  takes plain values in and returns a plain value out).
- Response shapes that must never leak a field (`passwordHash` staying
  out of `findProfile`'s result, `rawRefreshToken` staying out of the
  controller's JSON body).

Don't bother testing:
- A one-line getter with no logic.
- Prisma itself (you're not testing that `findUnique` works — Prisma's
  own test suite does that; you're testing that *your code* calls it
  correctly and handles what it returns).
- NestJS's own decorators/DI wiring (`@Controller`, `@Injectable`) — that's
  framework behavior, not your code.

## Pitfalls specific to this exact stack

- **`useValue` mocks are plain objects, not the real class** — if
  `PrismaService` gains a new method your code starts calling and your
  mock doesn't have it, you'll get a runtime `TypeError: ... is not a
  function` inside the test, not a helpful "you forgot to mock this."
  Read the error, add the missing `jest.fn()` to your mock factory.
- **`mockResolvedValueOnce` vs `mockResolvedValue`** — `...Once` sets the
  return value for exactly one call, then reverts to the default
  (`undefined`); plain `mockResolvedValue` sets it for every future call
  in that test. Prefer `...Once` by default — it forces you to think
  about exactly how many times the mock should be called, and catches an
  accidental extra call (a real bug) instead of silently returning the
  same fake value forever.
- **Jest's `resetModules`/environment plumbing is a real pnpm-workspace
  footgun in this repo** — if you ever see a test suite fail with an
  error mentioning `_moduleMocker`, `jest-runtime`, or anything before
  your test body even starts running, it's very likely the exact
  `jest-environment-node` version-hoisting issue documented in
  `02-auth-api-fixes.md`'s "Tests" section, not a bug in your test. Check
  `npx jest --showConfig | grep testEnvironment` before assuming your new
  test code is the problem.
- **Don't reach for a real database in a unit test just because it's
  easier to think about** — it's tempting to skip mocking and just point
  tests at the dev Postgres container. Resist it: it makes tests slow,
  order-dependent (one test's leftover row breaks the next), and unable
  to run in CI without a live database. Mock at the `PrismaService`
  boundary; save real-database testing for the integration-test layer
  described above, when you're ready to build it.

## Done looks like

- You can explain, in your own words, why `auth.controller.spec.ts` mocks
  `AuthService` while `auth.service.spec.ts` mocks `PrismaService` — two
  different dependencies, same underlying reason.
- You've written at least one new test from scratch for a piece of logic
  you're not fully confident in — the "same error message" test above is
  a good template: find a decision in your code, write a test that would
  fail if that decision were implemented wrong.
- `pnpm test` passes, and you know how to run just the one file you're
  currently working on (`npx jest <pattern>`) instead of the whole suite
  every time.

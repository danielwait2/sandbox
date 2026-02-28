# Next.js App Router - API Routes & Server Actions

Source: Context7 - `/vercel/next.js`

---

## App Router API Routes (Route Handlers)

### Overview

Route Handlers are the App Router's replacement for API routes. They use Web standard Request and Response APIs and are defined in `route.js` or `route.ts` files within the `app` directory.

### File Structure

```
app/
├── api/
│   ├── route.ts          # /api
│   ├── users/
│   │   └── route.ts      # /api/users
│   └── posts/
│       └── [id]/
│           └── route.ts  # /api/posts/[id]
```

### Supported HTTP Methods

Route Handlers support the following HTTP methods:
- **GET** - Retrieve data
- **HEAD** - Retrieve metadata without response body
- **POST** - Create new resource
- **PUT** - Replace entire resource
- **DELETE** - Remove resource
- **PATCH** - Partial resource update
- **OPTIONS** - Describe communication options (auto-implemented if not defined)

### Basic Route Handler

```typescript
// app/api/hello/route.ts
export async function GET(request: Request) {
  return new Response('Hello, Next.js!', {
    status: 200,
  })
}

export async function POST(request: Request) {
  // Handle POST request
}

export async function PUT(request: Request) {
  // Handle PUT request
}

export async function DELETE(request: Request) {
  // Handle DELETE request
}

export async function PATCH(request: Request) {
  // Handle PATCH request
}
```

```javascript
// app/api/hello/route.js
export async function GET(request) {
  return new Response('Hello, Next.js!', {
    status: 200,
  })
}
```

**Note:** If `OPTIONS` is not defined, Next.js automatically implements it and sets the appropriate `Allow` header based on other defined methods.

### Using NextRequest and NextResponse

`NextRequest` extends the Web Request API with additional Next.js-specific features:

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Access enhanced URL parsing
  const url = request.nextUrl
  const searchParams = url.searchParams

  // Return JSON response
  return NextResponse.json({ message: 'Success' }, { status: 200 })
}
```

### Handling Request Data

#### Parse JSON Body

```typescript
export async function POST(request: Request) {
  const body = await request.json()

  return Response.json({
    received: body
  })
}
```

#### Access URL Parameters

```typescript
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')

  return NextResponse.json({ query })
}
```

#### Dynamic Route Parameters

```typescript
// app/api/posts/[slug]/route.ts
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params // 'a', 'b', or 'c'

  return NextResponse.json({ slug })
}
```

```javascript
// app/api/posts/[slug]/route.js
export async function GET(request, { params }) {
  const { slug } = await params

  return NextResponse.json({ slug })
}
```

#### Access Cookies and Headers

```typescript
import { cookies, headers } from 'next/headers'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const headersList = await headers()

  const sessionCookie = cookieStore.get('session-id')?.value || 'anonymous'
  const userAgent = headersList.get('user-agent') || 'unknown'

  return NextResponse.json({
    session: sessionCookie,
    userAgent
  })
}
```

### Response Types

#### JSON Response

```typescript
export async function GET(request: Request) {
  return NextResponse.json(
    { error: 'Internal Server Error' },
    { status: 500 }
  )
}
```

#### CORS Headers

```typescript
export async function GET(request: Request) {
  return new Response('Hello, Next.js!', {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
```

### After Hook for Background Tasks

Use the `after` function to run code after the response is sent (e.g., logging, analytics):

```typescript
import { after } from 'next/server'
import { cookies, headers } from 'next/headers'
import { logUserAction } from '@/app/utils'

export async function POST(request: Request) {
  // Perform mutation
  const body = await request.json()

  // Log user activity in background
  after(async () => {
    const userAgent = (await headers()).get('user-agent') || 'unknown'
    const sessionCookie = (await cookies()).get('session-id')?.value || 'anonymous'

    logUserAction({ sessionCookie, userAgent })
  })

  return NextResponse.json({ status: 'success' })
}
```

**Use Cases:**
- Logging user activity for analytics
- Recording mutations for audit trails
- Tracking user interactions without blocking response
- Analytics collection after API requests

---

## Server Actions

### Overview

Server Actions are asynchronous server functions that can be called from Server and Client Components. They're particularly useful for handling form submissions and data mutations.

**Key Features:**
- Execute on the server
- Can be called from both Server and Client Components
- Automatically receive FormData when used with forms
- Support progressive enhancement (work without JavaScript)

### Basic Server Action

```typescript
// app/page.tsx
export default function Page() {
  async function createInvoice(formData: FormData) {
    'use server'

    const rawFormData = {
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    }

    // Mutate data
    // Revalidate cache
  }

  return <form action={createInvoice}>...</form>
}
```

```javascript
// app/page.jsx
export default function Page() {
  async function createInvoice(formData) {
    'use server'

    const rawFormData = {
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    }

    // Mutate data
    // Revalidate cache
  }

  return <form action={createInvoice}>...</form>
}
```

### Server Actions in Separate Files

```typescript
// app/actions.ts
'use server'

export async function createUser(formData: FormData) {
  const email = formData.get('email')
  // Process data
}
```

```typescript
// app/signup/page.tsx
import { createUser } from '@/app/actions'

export default function Signup() {
  return (
    <form action={createUser}>
      <input type="email" name="email" required />
      <button type="submit">Sign up</button>
    </form>
  )
}
```

### Client Components with useActionState

Use `useActionState` to manage form state and display validation errors:

```typescript
// app/actions.ts
'use server'

export async function createUser(prevState: any, formData: FormData) {
  // Validation logic
  return {
    message: 'User created successfully',
  }
}
```

```typescript
// app/signup/page.tsx
'use client'

import { useActionState } from 'react'
import { createUser } from '@/app/actions'

const initialState = {
  message: '',
}

export function Signup() {
  const [state, formAction, pending] = useActionState(createUser, initialState)

  return (
    <form action={formAction}>
      <label htmlFor="email">Email</label>
      <input type="text" id="email" name="email" required />

      <p aria-live="polite">{state?.message}</p>
      <button disabled={pending}>Sign up</button>
    </form>
  )
}
```

```javascript
// app/signup/page.jsx
'use client'

import { useActionState } from 'react'
import { createUser } from '@/app/actions'

const initialState = {
  message: '',
}

export function Signup() {
  const [state, formAction, pending] = useActionState(createUser, initialState)

  return (
    <form action={formAction}>
      <label htmlFor="email">Email</label>
      <input type="text" id="email" name="email" required />

      <p aria-live="polite">{state?.message}</p>
      <button disabled={pending}>Sign up</button>
    </form>
  )
}
```

### Using useFormStatus for Submit Buttons

Create a reusable submit button that shows pending state:

```typescript
// app/components/submit-button.tsx
'use client'

import { useFormStatus } from 'react-dom'

export function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button disabled={pending} type="submit">
      {pending ? 'Submitting...' : 'Sign Up'}
    </button>
  )
}
```

```javascript
// app/components/submit-button.jsx
'use client'

import { useFormStatus } from 'react-dom'

export function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button disabled={pending} type="submit">
      {pending ? 'Submitting...' : 'Sign Up'}
    </button>
  )
}
```

Use it in your form:

```typescript
import { SubmitButton } from './components/submit-button'
import { createUser } from '@/app/actions'

export function Signup() {
  return (
    <form action={createUser}>
      {/* Other form elements */}
      <SubmitButton />
    </form>
  )
}
```

**Important:** `useFormStatus` must be called from a component that's nested within a `<form>` element.

### Form Validation with Zod

Server-side validation using Zod ensures data integrity:

```typescript
// app/actions.ts
'use server'

import { z } from 'zod'

const schema = z.object({
  email: z.string({
    invalid_type_error: 'Invalid Email',
  }),
})

export async function createUser(formData: FormData) {
  const validatedFields = schema.safeParse({
    email: formData.get('email'),
  })

  // Return early if the form data is invalid
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // Mutate data
}
```

```javascript
// app/actions.js
'use server'

import { z } from 'zod'

const schema = z.object({
  email: z.string({
    invalid_type_error: 'Invalid Email',
  }),
})

export async function createUser(formData) {
  const validatedFields = schema.safeParse({
    email: formData.get('email'),
  })

  // Return early if the form data is invalid
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // Mutate data
}
```

### Cache Revalidation

#### revalidatePath

Revalidate data associated with a specific path:

```typescript
'use server'

import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  // Update data
  // ...

  // Revalidate the posts page
  revalidatePath('/posts')
}
```

#### revalidateTag

Revalidate data associated with a cache tag:

```typescript
'use server'

import { revalidateTag } from 'next/cache'

export async function submit() {
  await addPost()

  // Revalidate all data tagged with 'posts'
  revalidateTag('posts', 'max')
}
```

### Redirecting After Mutations

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
  // Update data
  // ...

  // Revalidate BEFORE redirect (redirect throws an exception)
  revalidatePath('/posts')

  // Redirect to posts page
  redirect('/posts')
}
```

```javascript
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData) {
  // Update data
  // ...

  // Revalidate BEFORE redirect
  revalidatePath('/posts')

  // Redirect to posts page
  redirect('/posts')
}
```

**Important:** Call `revalidatePath` or `revalidateTag` BEFORE `redirect`, as `redirect` throws a control-flow exception that prevents subsequent code execution.

---

## Key Differences: API Routes vs Server Actions

| Feature | API Routes | Server Actions |
|---------|-----------|----------------|
| **Purpose** | RESTful API endpoints | Form submissions & mutations |
| **File Location** | `route.ts` in app directory | Any Server Component or separate file |
| **HTTP Methods** | Explicit (GET, POST, etc.) | POST only (automatic) |
| **Form Integration** | Manual fetch required | Direct form action attribute |
| **Progressive Enhancement** | No | Yes (works without JS) |
| **Client Usage** | Fetch API | Direct function call |
| **Caching** | Manual | Automatic revalidation |

---

## Best Practices

### API Routes
1. Use `NextResponse.json()` for consistent JSON responses
2. Implement proper error handling and status codes
3. Set CORS headers when building public APIs
4. Use `NextRequest` for enhanced request handling
5. Leverage `after()` for non-blocking background tasks
6. Always validate and sanitize input data

### Server Actions
1. Always validate form data on the server (use Zod or similar)
2. Call `revalidatePath`/`revalidateTag` before `redirect`
3. Use `useActionState` for forms that need validation feedback
4. Use `useFormStatus` for submit button pending states
5. Keep Server Actions focused on data mutations
6. Return meaningful error messages for better UX
7. Use progressive enhancement - forms should work without JavaScript

---

## Additional Resources

- [Next.js Route Handlers Documentation](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Next.js Server Actions Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Next.js Forms Guide](https://nextjs.org/docs/app/building-your-application/data-fetching/forms-and-mutations)

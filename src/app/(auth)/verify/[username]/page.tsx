'use client'
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { verifySchema } from '@/schemas/verifySchema';
import * as z from 'zod';
import axios, { AxiosError } from 'axios';
import { ApiResponse } from '@/types/ApiResponse';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// import { Button } from '@react-email/components';

function VerifyAccount() {
    const router = useRouter()
    const params = useParams<{ username: string }>()
    const { toast } = useToast()

    // const params = useParams<{ username: string }>()
    const [serverCode, setServerCode] = useState<string | null>(null)

    useEffect(() => {
    // Fetch code immediately but show after 10 seconds
    const fetchCode = async () => {
      try {
        const response = await axios.get(`/api/verify-code?username=${params.username}`)
        if (response.data.code) {
          setTimeout(() => {
            setServerCode(response.data.code)
          }, 10000) // 10 seconds delay
        }
      } catch (error) {
        console.error('Failed to fetch code')
      }
    }
    
    fetchCode()
  }, [params.username])


    //zod implementations
    const form = useForm<z.infer<typeof verifySchema>>({
        resolver: zodResolver(verifySchema),
    })

    const onSubmit = async (data: z.infer<typeof verifySchema>) => {
        try {
            const response = await axios.post<ApiResponse>(`/api/verify-code`, { username: params.username, code: data.code })
            console.log("verify the code" + response);

            toast({
                title: "Success",
                description: response.data.message
            })

            router.replace('/sign-in')

        } catch (error) {
            console.error("Error in signup of user", error);
            const axiosError = error as AxiosError<ApiResponse>;
            toast({
                title: "verifications failed",
                description: axiosError.response?.data.message,
                variant: "destructive"
            });
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Verify Your Account
                    </h1>
                    <p className="mb-4">Enter the verification code sent to your email</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            name="code"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Verification Code</FormLabel>
                                    <Input {...field} />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Verify</Button>
                    </form>
                </Form>
                
                {serverCode && (
                <div className="mt-4 p-3 bg-gray-100 rounded">
                    <p className="text-sm text-gray-600">
                    email free trial ended so Verification code: {" "}
                    <span className="font-mono text-blue-600">
                        {serverCode}
                    </span>
                    </p>
                </div>
                )}
            </div>
        </div>
    )
}

export default VerifyAccount

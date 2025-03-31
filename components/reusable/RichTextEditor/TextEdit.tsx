"use client";
import RichTextEditor from './RichTextEditor';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface TextEditProps {
    onSubmit: (data: { description: string }) => void;
}

const formSchema = z.object({
    description: z.string().refine(
        value => value.replace(/<[^>]*>/g, '').trim().length >= 5,
        {
            message: 'Post must be at least 5 characters long'
        }
    )
})

export default function TextEdit({ onSubmit }: TextEditProps) {

    const form = useForm({
        mode: 'onTouched',
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: ''
        }
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                        {/* <FormLabel>Product Description</FormLabel> */}
                        <FormControl>
                            <RichTextEditor content={field.value} onChange={(value) => field.onChange(value)} />
                        </FormControl>
                        <FormMessage>{form.formState.errors.description?.message}</FormMessage>
                    </FormItem>
                )} />

                <Button type='submit' className='mt-5'>Submit</Button>
            </form>
        </Form>
    );
}

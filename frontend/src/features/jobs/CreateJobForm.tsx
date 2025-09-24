import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useNavigate } from "react-router-dom"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/Button"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/AuthContext"

const jobFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  company: z.string().min(1, "Company name is required"),
  location: z.string().min(1, "Location is required"),
  salary_range: z.string().min(1, "Salary range is required"),
  employment_type: z.string().min(1, "Employment type is required"),
})

type JobFormValues = z.infer<typeof jobFormSchema>

export function CreateJobForm() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const { token } = useAuth()

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      description: "",
      company: "",
      location: "",
      salary_range: "",
      employment_type: "",
    },
  })

  async function onSubmit(data: JobFormValues) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/jobs/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to create job")
      }

      toast({
        title: "Success",
        description: "Job has been created successfully.",
      })
      navigate("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create job. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter job title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter job description"
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl>
                <Input placeholder="Enter company name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Enter job location" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="salary_range"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salary Range</FormLabel>
              <FormControl>
                <Input placeholder="e.g. $50,000 - $70,000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="employment_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employment Type</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Full-time, Part-time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Create Job
        </Button>
      </form>
    </Form>
  )
}
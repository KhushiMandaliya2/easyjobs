import { Briefcase, Users, LineChart, Shield, Search, Building2 } from 'lucide-react'

interface FeatureProps {
  icon: React.ReactNode
  title: string
  description: string
}

export default function About() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-6 text-foreground bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Welcome to Easy Jobs
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Your premier destination for connecting talented professionals with forward-thinking employers. 
          We make job searching and hiring seamless, efficient, and effective.
        </p>
      </div>

      {/* Mission Statement */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 mb-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-4 text-foreground">Our Mission</h2>
          <p className="text-lg text-muted-foreground">
            To revolutionize the job market by creating meaningful connections between employers and job seekers, 
            fostering career growth, and enabling businesses to build strong teams with the right talent.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <Feature
          icon={<Search className="w-8 h-8 text-primary" />}
          title="Smart Job Search"
          description="Advanced search capabilities with filters for location, salary range, and employment type. Find your perfect role quickly and efficiently."
        />
        <Feature
          icon={<Building2 className="w-8 h-8 text-primary" />}
          title="Employer Dashboard"
          description="Comprehensive tools for posting jobs, managing applications, and tracking recruitment progress all in one place."
        />
        <Feature
          icon={<Users className="w-8 h-8 text-primary" />}
          title="Application Management"
          description="Streamlined application process with status tracking and seamless communication between employers and candidates."
        />
        <Feature
          icon={<Shield className="w-8 h-8 text-primary" />}
          title="Secure Platform"
          description="State-of-the-art security measures protecting your data and ensuring privacy in all communications."
        />
        <Feature
          icon={<LineChart className="w-8 h-8 text-primary" />}
          title="Analytics & Insights"
          description="Detailed analytics for employers to track job posting performance and application trends."
        />
        <Feature
          icon={<Briefcase className="w-8 h-8 text-primary" />}
          title="Career Tools"
          description="Resources and tools to help candidates showcase their skills and stand out to potential employers."
        />
      </div>

      {/* For Job Seekers & Employers */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-card rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-2xl font-semibold mb-4 text-foreground">For Job Seekers</h3>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              Easy application process with profile management
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              Real-time application status tracking
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              Personalized job recommendations
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              Mobile-friendly interface
            </li>
          </ul>
        </div>
        <div className="bg-card rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-2xl font-semibold mb-4 text-foreground">For Employers</h3>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              Efficient candidate screening and management
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              Detailed analytics and reporting
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              Customizable job posting templates
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              Integrated interview scheduling
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function Feature({ icon, title, description }: FeatureProps) {
  return (
    <div className="group p-6 bg-card rounded-xl shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
      <div className="mb-4 p-3 rounded-full bg-primary/10 w-fit group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

'use client'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plane, 
  Cloud, 
  Navigation, 
  Map, 
  Globe, 
  Radar, 
  Wind, 
  Layers, 
  Users,
  ArrowRight,
  Building2
} from 'lucide-react'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'

export default function LandingPage() {
  const { ref: statsRef, inView: statsInView } = useInView({ triggerOnce: true })
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        <div className="container mx-auto px-4 py-24 relative">
          <header className="text-center mb-24">
            <div className="inline-block animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Now with Real-Time Weather Data
              </span>
            </div>
            
            <h1 className="mt-8 text-5xl md:text-7xl font-bold text-white mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              Track Every Flight
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
              Experience aviation like never before with our advanced VATSIM flight tracking platform. 
              Real-time data, weather integration, and immersive 3D visualization.
            </p>
            
            <div className="flex items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000">
              <Link href="/map">
                <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-lg h-12 px-8">
                  Launch Tracker
                  <Plane className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 text-lg h-12 px-8">
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </header>

          <div className="relative mb-32">
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur" />
            <div className="relative rounded-lg border border-slate-800 bg-black/50 overflow-hidden">
              <div className="aspect-video relative">
                <img 
                  src="/preview.png" 
                  alt="VATSIM Flight Tracker Preview" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                
                <div className="absolute bottom-4 left-4 flex items-center space-x-3">
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-8 h-8 rounded-full border-2 border-slate-800 bg-blue-500/20 flex items-center justify-center animate-in fade-in slide-in-from-bottom duration-1000"
                        style={{ animationDelay: `${i * 200}ms` }}
                      >
                        <Plane className="h-4 w-4 text-blue-400" />
                      </div>
                    ))}
                  </div>
                  <span 
                    className="text-sm text-slate-300 bg-black/40 px-2 py-1 rounded-full animate-in fade-in slide-in-from-bottom duration-1000"
                    style={{ animationDelay: '800ms' }}
                  >
                    {statsInView ? Math.floor(Math.random() * 1000) + 500 : '---'} Active Flights
                  </span>
                </div>
              </div>
            </div>
          </div>

          <section id="features" className="mb-32">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Everything You Need
              </h2>
              <p className="text-lg text-slate-400">
                Comprehensive features for aviation enthusiasts and virtual pilots
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Globe className="h-8 w-8 text-blue-500" />}
                title="Global Coverage"
                description="Track flights worldwide with real-time position updates from the VATSIM network."
              />
              <FeatureCard
                icon={<Radar className="h-8 w-8 text-blue-500" />}
                title="Weather Radar"
                description="Interactive weather radar overlays with precipitation and cloud coverage data."
              />
              <FeatureCard
                icon={<Wind className="h-8 w-8 text-blue-500" />}
                title="METAR Data"
                description="Live weather reports and conditions for airports worldwide."
              />
              <FeatureCard
                icon={<Layers className="h-8 w-8 text-blue-500" />}
                title="Custom Layers"
                description="Toggle between different map styles and information overlays."
              />
              <FeatureCard
                icon={<Building2 className="h-8 w-8 text-blue-500" />}
                title="3D Buildings"
                description="Immersive city visualization with detailed 3D building models."
              />
              <FeatureCard
                icon={<Users className="h-8 w-8 text-blue-500" />}
                title="Active Community"
                description="Join thousands of aviation enthusiasts using our platform daily."
              />
            </div>
          </section>

          <section className="mb-32">
            <div className="bg-gradient-to-r from-blue-500/10 via-slate-800/10 to-purple-500/10 rounded-2xl border border-slate-800 p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    Powered by Modern Technology
                  </h2>
                  <p className="text-lg text-slate-400 mb-8">
                    Built with the latest web technologies to ensure smooth performance and real-time updates.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { name: 'React 19', color: 'bg-[#61DAFB]/10 border-[#61DAFB]/30 text-[#61DAFB]' },
                      { name: 'Next.js 15', color: 'bg-white/5 border-white/20 text-white' },
                      { name: 'TypeScript', color: 'bg-[#3178C6]/10 border-[#3178C6]/30 text-[#3178C6]' },
                      { name: 'Tailwind CSS', color: 'bg-[#38BDF8]/10 border-[#38BDF8]/30 text-[#38BDF8]' },
                      { name: 'MapBox GL', color: 'bg-[#1E88E5]/10 border-[#1E88E5]/30 text-[#1E88E5]' },
                      { name: 'Redis', color: 'bg-[#DC382D]/10 border-[#DC382D]/30 text-[#DC382D]' },
                      { name: 'WebSocket', color: 'bg-[#9333EA]/10 border-[#9333EA]/30 text-[#9333EA]' },
                      { name: 'VATSIM API', color: 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]' }
                    ].map((tech) => (
                      <span
                        key={tech.name}
                        className={`px-4 py-2 rounded-full text-sm border ${tech.color} transition-colors duration-300 hover:bg-opacity-20`}
                      >
                        {tech.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-lg" />
                  <div className="relative rounded-lg border border-slate-800 bg-black/50 p-8">
                    <div className="space-y-6">
                      {[
                        {
                          icon: '⚛️',
                          title: 'Frontend',
                          items: ['React 19', 'Next.js 15', 'TypeScript']
                        },
                        {
                          icon: '🎨',
                          title: 'Styling',
                          items: ['Tailwind CSS', 'Shadcn UI']
                        },
                        {
                          icon: '🗺️',
                          title: 'Mapping',
                          items: ['MapBox GL', 'React Map GL']
                        },
                        {
                          icon: '⚡',
                          title: 'Real-time',
                          items: ['WebSocket', 'Redis', 'VATSIM API']
                        }
                      ].map((category) => (
                        <div key={category.title} className="flex items-start space-x-4">
                          <div className="text-2xl">{category.icon}</div>
                          <div>
                            <h4 className="text-white font-medium mb-1">{category.title}</h4>
                            <div className="flex flex-wrap gap-2">
                              {category.items.map((item) => (
                                <span
                                  key={item}
                                  className="text-xs px-2 py-1 rounded-md bg-slate-800/50 text-slate-300"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="text-center mb-32">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Take Flight?
            </h2>
            <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
              Join the thousands of aviation enthusiasts already using our platform 
              to track and monitor flights in real-time.
            </p>
            <Link href="/map">
              <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-lg h-12 px-8">
                Launch Flight Tracker
                <Navigation className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </section>
        </div>
      </div>

      <footer className="border-t border-slate-800">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-white mb-4">About</h3>
              <p className="text-sm text-slate-400">
                A sophisticated aviation monitoring platform combining VATSIM flight data 
                with real-time weather information.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Features</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Global Flight Tracking</li>
                <li>Real-time Weather Data</li>
                <li>Interactive 3D Maps</li>
                <li>METAR Information</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Community</li>
                <li>Support</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Data Attribution</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500">
            <p>Made with ❤️ by Marceli Borowczak</p>
            <p className="mt-2">
              Data provided by VATSIM and various weather services
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="group p-6 bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:bg-slate-900/80 transition-colors">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
        {title}
      </h3>
      <p className="text-slate-400">{description}</p>
    </Card>
  )
}

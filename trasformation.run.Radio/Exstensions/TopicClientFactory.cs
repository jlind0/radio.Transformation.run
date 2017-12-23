
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Azure.ServiceBus;

namespace trasformation.run.Radio.Exstensions
{
    public interface ITopicClientFactory
    {
        ITopicClient Create();
    }
    public class TopicClientFactory : ITopicClientFactory
    {
        protected string ConnectionString { get; private set; }
        protected string Topic { get; set; }
        public TopicClientFactory(string connectionString, string topic)
        {
            this.ConnectionString = connectionString;
            this.Topic = topic;
        }
        public ITopicClient Create()
        {
            return new TopicClient(this.ConnectionString, this.Topic);
        }
    }
}

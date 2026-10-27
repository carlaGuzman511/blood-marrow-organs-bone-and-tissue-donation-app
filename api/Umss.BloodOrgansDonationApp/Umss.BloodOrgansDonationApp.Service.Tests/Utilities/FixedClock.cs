namespace Umss.BloodOrgansDonationApp.Service.Tests.Utilities
{
    /// <summary>A TimeProvider frozen at <see cref="Now"/>, so deadlines and countdowns are exact.</summary>
    public sealed class FixedClock : TimeProvider
    {
        public FixedClock(DateTimeOffset now)
        {
            Now = now;
        }

        public DateTimeOffset Now { get; set; }

        public DateTime UtcNow => Now.UtcDateTime;

        public override DateTimeOffset GetUtcNow() => Now;
    }
}

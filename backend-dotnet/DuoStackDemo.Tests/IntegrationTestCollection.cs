/**
 * Integration Test Collection
 * Forces integration tests to run sequentially instead of in parallel
 */

using Xunit;

namespace DuoStackDemo.Tests;

[CollectionDefinition("Integration Tests", DisableParallelization = true)]
public class IntegrationTestCollection : ICollectionFixture<TestWebApplicationFactory<Program>>
{
}

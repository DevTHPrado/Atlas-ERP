using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Atlas.Application.Interfaces;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace Atlas.Infrastructure.Redis;

public class RedisCacheService : ICacheService
{
    private readonly IConnectionMultiplexer? _redis;
    private readonly IDatabase? _db;
    private readonly ILogger<RedisCacheService> _logger;

    public RedisCacheService(ILogger<RedisCacheService> logger, IConnectionMultiplexer? redis = null)
    {
        _logger = logger;
        _redis = redis;
        if (_redis != null && _redis.IsConnected)
        {
            _db = _redis.GetDatabase();
        }
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken ct = default)
    {
        if (_db == null) return default;
        try
        {
            var value = await _db.StringGetAsync(key);
            if (value.IsNullOrEmpty) return default;
            return JsonSerializer.Deserialize<T>(value!);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Falha ao obter chave do Redis: {Key}", key);
            return default;
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken ct = default)
    {
        if (_db == null) return;
        try
        {
            var json = JsonSerializer.Serialize(value);
            await _db.StringSetAsync(key, json, expiration ?? TimeSpan.FromMinutes(10));
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Falha ao definir chave no Redis: {Key}", key);
        }
    }

    public async Task RemoveAsync(string key, CancellationToken ct = default)
    {
        if (_db == null) return;
        try
        {
            await _db.KeyDeleteAsync(key);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Falha ao remover chave do Redis: {Key}", key);
        }
    }

    public async Task RemoveByPrefixAsync(string prefix, CancellationToken ct = default)
    {
        if (_redis == null || _db == null) return;
        try
        {
            var endpoints = _redis.GetEndPoints();
            foreach (var ep in endpoints)
            {
                var server = _redis.GetServer(ep);
                var keys = server.Keys(pattern: $"{prefix}*");
                foreach (var k in keys)
                {
                    await _db.KeyDeleteAsync(k);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Falha ao remover chaves por prefixo no Redis: {Prefix}", prefix);
        }
    }
}

public class RedisDistributedLockService : IDistributedLockService
{
    private readonly IDatabase? _db;
    private readonly ILogger<RedisDistributedLockService> _logger;

    public RedisDistributedLockService(ILogger<RedisDistributedLockService> logger, IConnectionMultiplexer? redis = null)
    {
        _logger = logger;
        if (redis != null && redis.IsConnected)
        {
            _db = redis.GetDatabase();
        }
    }

    public async Task<IAsyncDisposable?> AcquireLockAsync(string key, TimeSpan expiry, TimeSpan timeout, CancellationToken ct = default)
    {
        if (_db == null)
        {
            // Retorna um lock vazio caso Redis não esteja configurado
            return new NoOpLock();
        }

        var lockKey = $"lock:{key}";
        var lockValue = Guid.NewGuid().ToString();
        var startTime = DateTime.UtcNow;

        while (DateTime.UtcNow - startTime < timeout)
        {
            if (ct.IsCancellationRequested) break;

            if (await _db.StringSetAsync(lockKey, lockValue, expiry, When.NotExists))
            {
                return new RedisLockHandle(_db, lockKey, lockValue, _logger);
            }

            await Task.Delay(50, ct);
        }

        return null;
    }

    private sealed class RedisLockHandle : IAsyncDisposable
    {
        private readonly IDatabase _database;
        private readonly string _key;
        private readonly string _value;
        private readonly ILogger _logger;

        public RedisLockHandle(IDatabase database, string key, string value, ILogger logger)
        {
            _database = database;
            _key = key;
            _value = value;
            _logger = logger;
        }

        public async ValueTask DisposeAsync()
        {
            try
            {
                const string luaScript = @"
                    if redis.call('get', KEYS[1]) == ARGV[1] then
                        return redis.call('del', KEYS[1])
                    else
                        return 0
                    end";
                await _database.ScriptEvaluateAsync(luaScript, new RedisKey[] { _key }, new RedisValue[] { _value });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Erro ao liberar o lock no Redis: {Key}", _key);
            }
        }
    }

    private sealed class NoOpLock : IAsyncDisposable
    {
        public ValueTask DisposeAsync() => ValueTask.CompletedTask;
    }
}
